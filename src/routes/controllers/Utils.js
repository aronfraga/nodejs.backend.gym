// const axios = require('axios');

const { Class, Routine, User, Muscle, Excercise, User_Routine, Routine_Excercise, Item, Sale } = require('../../db.js');

const nodemailer = require("nodemailer")


const getClass = async () => {
    const classes = await Class.findAll({
        include: [{
            model: User,
            attributes: ["imgUrl", "name"],
        }]
    })
    return classes;
}

const getExcercises = async () => {
    const excercises = await Excercise.findAll({
        include: [
            {
                model: Muscle,
            },
            {
                model: Routine,
            },
        ]
    })
    return excercises;
}

const findUserRoutinesById = async (id, name, category, duration, difficulty, imgUrl) => {
    const usersModel = await User.findAll({
        include: [
            {
                model: Routine,
                attributes: ["name", "createdBy", "duration", "difficulty", "category", "imgUrl"],
                where: {
                    id: id,
                    name: {
                        [Sequelize.Op.in]: name
                    },
                    category: {
                        [Sequelize.Op.in]: category
                    },
                    duration: {
                        [Sequelize.Op.in]: duration
                    },
                    difficulty: {
                        [Sequelize.Op.in]: difficulty
                    },
                }
            },
        ],
    });
    return usersModel;
};


const filterData = (userData, filters) => {

    let filtered = userData;

    if (filters.muscles) {
        filtered.map(e => {
            let setAux = new Set()
            for (i = 0; i < e.excercises.length; i++) {
                if (filters.muscles.includes(e.excercises[i].muscle.name))setAux.add(e.excercises[i].muscle.name)
            }
            let arrayAux = [];
            setAux.forEach(e => arrayAux.push(e))
            arrayAux.sort();
            filters.muscles.sort();
            if(JSON.stringify(arrayAux)==JSON.stringify(filters.muscles)) e.flag = true;

        })
    
    filtered = filtered.filter(e => e.flag === true)
    }

    if (filters.duration) filtered = filtered.filter(e => filters.duration.includes(e.duration))

    if (filters.difficulty) filtered = filtered.filter(e => filters.difficulty.includes(e.difficulty))

    if (filters.favourite) filtered = filtered.filter(e => e.User_Routine.favourite === true)

    return filtered;

}

const checkFavs = async (userData, id) => {

    const tabla = await User_Routine.findAll({ where: { userId: id } })

    const favsIds = [];

    tabla.map(e => {
        if (e.favourite) favsIds.push(e.routineId)
    })

    userData.map(e => {
        if (favsIds.includes(e.id)) e.favByUser = true;
    })

    return userData

}

  const createExcercises = async (excercises,routineId) => {

    for(i=0;i<excercises.length;i++){
        const { day, name , series, repetitions, gifUrl, muscleId} = excercises[i]

        if ( !day || !name || !series || !repetitions || !muscleId) return false

        const newExcercise = await Excercise.create({
            day: day,
            name: name,
            series: series,
            repetitions: repetitions,
            gifUrl: gifUrl,
            muscleId: muscleId
        })

        await Routine_Excercise.create({routineId: routineId,excerciseId: newExcercise.id})

    }

    return true

  }

  const updateExcercises = async (excercises) => {

    for(i=0;i<excercises.length;i++){

        const { excerciseId } = excercises[i]

        if ( !excerciseId || !excercises[i].excerciseChanges) return false

        const excerciseToUpdate = await Excercise.findByPk(excerciseId)

        await excerciseToUpdate.update(excercises[i].excerciseChanges)

        }

        return true
    }

    const createSale = async (data,id) => {

        let sumaItems = 0;

        const newSale = await Sale.create({
            purchaseId:data.id,
            userId: id
        })

        const items = data.items;

        for(let i=0;i < items.length;i++){
            
            await Item.create({
                title: items[i].title,
                unit_price: items[i].unit_price,
                quantity: items[i].quantity,
                saleId: newSale.id
            })

            const aux = items[i].unit_price * items[i].quantity

            sumaItems = sumaItems + aux
        }

        await newSale.update({totalCost: sumaItems})

    }

  const relaciones = async () => {

    const ej1 = await Excercise.findByPk(1)
    await ej1.setMuscle(1)
    const ej2 = await Excercise.findByPk(2)
    await ej2.setMuscle(1)
    const ej3 = await Excercise.findByPk(3)
    await ej3.setMuscle(6)
    const ej4 = await Excercise.findByPk(4)
    await ej4.setMuscle(2)
    const ej5 = await Excercise.findByPk(5)
    await ej5.setMuscle(4)
    const ej6 = await Excercise.findByPk(6)
    await ej6.setMuscle(5)
    const ej7 = await Excercise.findByPk(7)
    await ej7.setMuscle(2)
    const ej8 = await Excercise.findByPk(8)
    await ej8.setMuscle(2)
    const ej9 = await Excercise.findByPk(9)
    await ej9.setMuscle(2)
    const ej10 = await Excercise.findByPk(10)
    await ej10.setMuscle(1)
    const ej11 = await Excercise.findByPk(11)
    await ej11.setMuscle(4)
    const ej12 = await Excercise.findByPk(12)
    await ej12.setMuscle(6)
    const ej13 = await Excercise.findByPk(13)
    await ej13.setMuscle(2)
    const ej14 = await Excercise.findByPk(14)
    await ej14.setMuscle(4)
    const ej15 = await Excercise.findByPk(15)
    await ej15.setMuscle(5)
    const ej16 = await Excercise.findByPk(16)
    await ej16.setMuscle(5)
    const ej17 = await Excercise.findByPk(17)
    await ej17.setMuscle(7)
    const ej18 = await Excercise.findByPk(18)
    await ej18.setMuscle(4)
    const ej19 = await Excercise.findByPk(19)
    await ej19.setMuscle(2)
    const ej20 = await Excercise.findByPk(20)
    await ej20.setMuscle(5)
    const ej21 = await Excercise.findByPk(21)
    await ej21.setMuscle(6)
    const ej22 = await Excercise.findByPk(22)
    await ej22.setMuscle(5)
}

const filterProducts = (productData,filters) => {

    let productFilter = productData.products;


    if (filters.category) productFilter = productFilter.filter(e => filters.category.includes(e.dataValues.category))

    if (filters.min) productFilter = productFilter.filter(e => filters.min <= (e.dataValues.unit_price))

    if (filters.max) productFilter = productFilter.filter(e => filters.max >= (e.dataValues.unit_price))

    return productFilter;
}

const expiredMembresyUpdate = async (allUsers) => {
    const localDate = new Date();
    
    for (let i = 0; i < allUsers.length; i++) {
        let userExpDate = new Date(Date.parse(allUsers[i].membresyExpDate))
        if(userExpDate < localDate) allUsers[i].update({expiredMembresy: true})
        else allUsers[i].update({expiredMembresy: false})}
}

const filterUsers = (allUsers, filters) => {
    expiredMembresyUpdate(allUsers)
    
    let result = allUsers;

    if (filters.expiredMembresy===true || filters.expiredMembresy===false) result = result.filter(e => filters.expiredMembresy === e.expiredMembresy)
    
    return result

}

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: products } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);
  
    return { totalItems, products, totalPages, currentPage };
  };

  const getPagination = (page, size) => {
    const limit = size ? size : 10;
    const offset = page ? page * limit : 0;
    return { limit, offset };
  };

const addDaysToUser = async (id,days) => {
    
    const userData = await User.findByPk(id)

    const localDate = new Date();

    if(userData.membresyExpDate < localDate){

    localDate.setDate(localDate.getDate() + days)

    const dateToString = localDate.toString()

    userData.update({membresyExpDate: dateToString})

    }else{

    const newDate = new Date(Date.parse(userData.membresyExpDate))
   
    newDate.setDate(newDate.getDate() + days);

    const dateToString = newDate.toString()

    userData.update({membresyExpDate: dateToString})

    }

    
}

const expiredUsers = async () => {

    let expiredUsers = []

    const allUsers = await User.findAll()

    allUsers.map(e => {

        const userExpDate = new Date(Date.parse(e.membresyExpDate))

        const actualDate = new Date()

        if(userExpDate < actualDate){

            expiredUsers.push({
                name: e.name,
                email: e.email,
                membresyExpDate: userExpDate
            })
        }
    })

    return expiredUsers

}

const sendEmail = async (sale,buyer) => {

    const url = "https://app-gym-frontend.vercel.app/feedback"

    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: "mgalara@gmail.com", // generated ethereal user
          pass: "ydtdjiidhgpkupal", // generated ethereal password
        },
      });
    
      await transporter.sendMail({
        from: '"Gym Fit" <mgalara@gmail.com>', // sender address
        to: `${buyer.userEmail}`, // list of receivers
        subject: "Gracias por tu compra!", // Subject line
        text: "Muchas gracias por tu compra, te dejamos el detalle de la misma y por cualquier sugerencia un link para que des tu feedback", // plain text body
        html: `
        <div>
        <p>Muchas gracias por tu compra, te dejamos el detalle de la misma y por cualquier sugerencia un link para que des tu feedback</p>
        <p>Total comprado: ${sale.totalCost}</p>
        <p>Metodo de pago: ${sale.paymentMethod}</p>
        <p>Items comprados: ${sale.items? sale.items.length : sale.name}</p>
        <br></br>
        <p>Para dejar tu feedback dirigete a:</p>
        <a href=${url}>=> Feedback <=</a>
        <div/>
        `, // html body
      });

}

module.exports = { sendEmail, expiredUsers, getPagingData, getPagination, addDaysToUser, getClass ,findUserRoutinesById, filterData, relaciones, checkFavs, getExcercises, createExcercises, updateExcercises, filterProducts, createSale, filterUsers }


