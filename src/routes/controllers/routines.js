const { Router } = require('express');
const { User , Routine, Excercise, Muscle, Product, Membresy, Class, User_Routine, Category} = require('../../db.js');
const { filterData, findUserRoutinesById, checkFavs , createExcercises, updateExcercises} = require('./Utils.js');
const userExtractor = require('../middleware/userExtractor.js')
const { Op } = require("sequelize");

const router = Router();

router.delete('/:idRoutine', userExtractor, async (req, res) => {

    const {idRoutine} = req.params;

    if (!idRoutine) return res.status(400).send("Faltan datos")

    try {

    const routineToDelete = await Routine.findByPk(idRoutine);

    await routineToDelete.destroy()

    return res.status(200).send("Rutina eliminada correctamente")

    } catch (error) {
        res.status(400).send(error.message)
    } 
})

router.get('/:idRoutine', userExtractor, async (req, res) => {
    try {
        const { idRoutine } = req.params;
        const routineSelected = await Routine.findByPk(idRoutine,{
            include:[
                {
                    model: Category,
                },
                {
                    model: Excercise,
                    include:{
                        model: Muscle
                    }
                },
            ]
        });    
        res.status(200).send(routineSelected);
    } catch (error) {
        res.status(400).send(error.message)
    }
    
})

router.post('/filter', userExtractor, async (req, res) => {

    const { id , filters } = req.body;

    const { favourite } = req.query;

    let userData;

    let dataFiltered;

    if(favourite) {

        try {
            userData = await User.findByPk(id, {
                include:{
                    model: Routine,
                    include:[
                        {
                            model: Category,
                        },
                        {
                            model: Excercise,
                            include:{
                                model: Muscle
                            }
                        },
                    ]
                }
            })
        } catch (error) {
            res.status(400).send(error.message)
        }

        dataFiltered = filterData(userData.routines,{owned:true,favourite:true})
        
        dataFiltered.map(e => e.favByUser= true)

        return res.status(200).json(dataFiltered)
    }

    if(filters.favourite){

        try {
            userData = await User.findByPk(id, {
                include:{
                    model: Routine,
                    include:[
                        {
                            model: Category,
                        },
                        {
                            model: Excercise,
                            include:{
                                model: Muscle
                            }
                        },
                    ]
                }
            })
        } catch (error) {
            res.status(400).send(error.message)
        }

    dataFiltered = filterData(userData.routines,filters)

    }else{

        try {
            userData = await Routine.findAll({
                include:[
                    {
                        model: Category,
                    },
                    {
                        model: Excercise,
                        include:{
                            model: Muscle
                        }
                    },
                ]
            })
        } catch (error) {
            res.status(400).send(error.message)
        }

    const newUserData = await checkFavs(userData,id);
        
    if(Object.entries(filters).length === 0) return res.status(200).json(newUserData)

    dataFiltered = filterData(newUserData,filters)

    }

    res.status(200).json(dataFiltered)

})

router.post('/', userExtractor, async (req, res) => {

    const { name, duration, difficulty, categoryId, imgUrl, userName, excercises} = req.body;


    if (!name || !duration || !difficulty || !userName || !excercises || excercises.length === 0 || !categoryId) return res.status(400).json('Faltan datos')

    try {
        
        const newRoutine = await Routine.create({
            name,
            createdBy: userName,
            duration,
            difficulty,
            imgUrl,
            categoryId,
        });
            
        const validator = await createExcercises(excercises,newRoutine.id)

        if(!validator) return res.status(400).json('Faltan datos')

        const rutinaCompleta = await Routine.findByPk(newRoutine.id,{
            include:[
                {
                    model: Category,
                },
                {
                    model: Excercise,
                    include:{
                        model: Muscle
                    }
                },
            ]
        })

        return res.status(200).json(rutinaCompleta);

    } catch (error) {
        return res.status(400).send(error.message)
    }
})

router.put('/', userExtractor, async (req, res) => {

    const { routineId, routineChanges, excercises} = req.body;

    if (!routineId || !routineChanges) return res.status(400).json('Faltan datos')

    try {
        
        const routineToUpdate = await Routine.findByPk(routineId)

        if(routineToUpdate) await routineToUpdate.update(routineChanges)
        else return res.status(404).send("No se encontro esa rutina")

        let validator = true;
            
        if(excercises.length !==0) validator = await updateExcercises(excercises) 

        if(!validator) return res.status(400).json('Faltan datos')

        const rutinaCompleta = await Routine.findByPk(routineId,{
            include:[
                {
                    model: Category,
                },
                {
                    model: Excercise,
                    include:{
                        model: Muscle
                    }
                },
            ]
        })

        return res.status(200).json(rutinaCompleta);

    } catch (error) {
        return res.status(400).send(error.message)
    }
})

router.patch('/:idRoutine', userExtractor, async (req, res) => {

    const { id } = req.body;
    const { idRoutine } = req.params;

    if(!id || !idRoutine) return res.status(400).send("Faltan datos");

    try {
        const routine = await User_Routine.findOne({
            where:{
                [Op.and]: [{ userId: id }, { routineId: idRoutine }],
            }
        })

        const aux = routine.favourite
    
    await routine.update({
        favourite:!aux,
    })

    res.status(200).json(routine)

    } catch (error) {

        const newLink = await User_Routine.create({
            favourite: true,
            userId: id,
            routineId: idRoutine
        })

        res.status(200).json(newLink)
        
    }
    
})

module.exports = router;