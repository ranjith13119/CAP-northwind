const cds = require('@sap/cds');
const {
	Readable,
	PassThrough
} = require('stream')
const UsersService = cds.connect.to('UsersService');

module.exports = cds.service.impl((srv) => {

	const {
		Customer,
		Products,
		cartItems,
		Orders,
		Order_items,
		Pictures
	} = srv.entities

	/*************** action *******************************/

	srv.on('cancelOrder', async req => {
		let {
			ID,
			reason
		} = req.data

		const oOrder = await cds.transaction(req).run(
			SELECT.from(Orders).where('ID =', ID)
		);
		if (oOrder.length > 0) {
			var date1 = new Date(oOrder[0].orderDate)
			var date2 = new Date()
			var Difference_In_Time = date2.getTime() - date1.getTime()
			Difference_In_Time = (Difference_In_Time / (1000 * 3600 * 24))
			if (Difference_In_Time > 40) {
				req.error(409, `Order ${ID} has expired`, ID)
			}
			const affectedRows = await cds.transaction(req).run(
				UPDATE(Orders).set(' order_status=', 'canceled')
				.where('ID =', ID).and('order_status !=', 'canceled')
			)
			affectedRows > 0 ? console.log("Order canceled") :
				req.error(409, `Sorry. Order ${ID} could not be canceled. Because it is 'shipped' already or already Canceled`, ID);
		} else {
			req.error(409, `Couldn't find the Ordered ${ID}`, ID)
		}
	})

	/********************** Event  ***********************/

	srv.on('UpdateShippingdetails', async req => {

		let {
			custID,
			ship_mode
		} = req.data

		var tx = cds.transaction(req);
		var items = await tx.run(SELECT.from(cartItems).where('customers_customerID =', custID))
		if (items.length <= 0) {
			req.error(409, `Not found`);
		} else {
			items.forEach(async(item) => {
				var affectedrows = await tx.run(UPDATE(cartItems).set('shipVia=', ship_mode).where('ID=', item.ID))
				if (affectedrows <= 0) {
					req.error(409, `Could not be updated`);
				} else {
					return ("updated")
				}
			})
		}

	})

	/********************** Function *********************/

	srv.on("fnTestCal", async req => {

		var order = await cds.transaction(req).run(
			//SELECT.from(Order_items).where("parent_ID=", req.data.custID)
			SELECT.from(cartItems).where('customers_customerID=', req.data.custID)
		);
		var total = 0;
		if (order) {
			order.forEach(item => {
				total += item.netamount
			})
		}
		const sSymbol = await UsersService.getGreeting('The total is');
		return (`${total}`);
	})

	/****************** Entity LifeCycles **************/

	// srv.before(['READ', 'CREATE', 'UPDATE', 'PATCH', 'DELETE'], [], async req => {
	// 	var targetName = req.target.name
	// 	var logonName = req.attr.userInfo.logonName
	// 	console.log("READ - logonName: " + logonName)
	// 	console.log("READ - req.target.name: " + targetName)

	// 	cds.transaction(req).run(
	// 		SELECT.one.from(Customer).where({
	// 			customerID: logonName
	// 		})
	// 	).then(user => {
	// 		if (user.length === 0) {
	// 			req.error(409, `We couldn't find the user name. Please register or Login with the valid User details.`)
	// 		}
	// 	})
	// })

	srv.before(['CREATE'], "cartItems", async(req) => {
		var {
			products_productID: productID,
			customers_customerID: custID
		} = req.data

		var items = await cds.transaction(req).run(
			SELECT.from(cartItems).where('products_productID =', productID).and('customers_customerID =', custID)
		)
		if (items.length > 0) {
			req.error(409, "Item is already available in your cart list");
		}
	})

	// Quantity Check
	srv.before(['UPDATE'], "cartItems", async(req) => {
		var {
			products_productID: productID,
			quantity: quantity,
			ID: ID
		} = req.data
		var tx = cds.transaction(req)
		return tx.run(
			SELECT.from(Products, ['unitsInStock', 'unitPrice']).where('productID =', productID).and('unitsInStock >=', quantity)
		).then(item => {
			if (item.length === 0) {
				req.error(409, `${quantity} exceeds stock for book #${productID}`)
			} else {
				tx.run(UPDATE(cartItems).set('netamount =', (item[0].unitPrice * quantity)).where('Id=', ID))
			}
		})
	})

	// // Check if the stocks is available
	srv.before(['CREATE'], 'Orders', async(req) => {
		var {
			order_status: status,
			items: orderItems,
			customer_customerID: customerID
		} = req.data,
			tx = cds.transaction(req),
			total = 0;

		if (status === 'ordered') {

			orderItems.forEach(item => {
				total += item.netamount
			});

			if (total != req.data.price) {
				return req.error(409, "Something went wrong while calculating the total.");
			}

			return cds.transaction(req).run(() => orderItems.map(item =>
				UPDATE(Products).set('unitsInStock -=', item.quantity)
				.where('productID =', item.products_productID).and('unitsInStock >=', item.quantity)
			)).then(all => all.forEach((affectedRows, i) => {
				if (affectedRows === 0) {
					req.error(409, ` Book #${orderItems[i].products_productID} is Sold out, sorry`, orderItems[i].amount)
				} else {
					tx.run(DELETE.from(cartItems).where('customers_customerID=', customerID))
				}
			}))
		}
	})

	srv.on('READ', 'Pictures', async(req, next) => {
		if (!req.data.ID) {
			return next()
		}

		const url = req._.req.path
		if (url.includes('content')) {
			const id = req.data.ID
			console.log(id)
			var tx = cds.transaction(req);
			var mediaObj = await tx.run(SELECT.from(Pictures).where('ID =', id))
			if (mediaObj.length <= 0) {
				req.reject(404, 'Media not found for the ID')
				return
				
			}
			for (var i in mediaObj) {
				decodedMedia = new Buffer(
					mediaObj[i].content.split(';base64,').pop(),
					'base64'
				)
			}
			return _formatResult(decodedMedia)
		} else return next()

	})

	function _formatResult(decodedMedia) {
		const readable = new Readable()
		const result = new Array()
		readable.push(decodedMedia)
		readable.push(null)
		result.push({
			value: readable
		})
		return result
	}
})