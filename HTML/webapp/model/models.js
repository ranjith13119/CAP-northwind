sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"HTML/HTML/model/common"
], function (JSONModel, Device, common) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createProducts: function (oComponent, callback) {
			var oModel = oComponent.oOwnerComponent.getModel(),
				oData = oComponent.oProductData;

			oModel.create("/Products", oData, {
				success: function (response) {
					callback(true);
				},
				error: function (oError) {
					callback(false);
				}
			});
		},
		
		onImageUpload : function (oComponent, callback) {
			var oModel = oComponent.oOwnerComponent.getModel(),
				payload = {
					// "content" : btoa(encodeURI(oComponent.content)),
					"content" : oComponent.content,
					"mediaType" : oComponent.fileType,
					"filename" : oComponent.fileName
				}
			oModel.create("/Pictures", payload, {
				success: function (response) {
					callback(true);
				},
				error: function (oError) {
					callback(false);
				}
			});	
		},

		onAddTocart: function (oComponent, callback) {
			var oModel = oComponent.oOwnerComponent.getModel(),
				oData = oModel.getProperty("/" + oComponent._product),
				oCartData = {
					products_productID: oData.productID,
					customers_customerID: sap.ushell.Container.getService("UserInfo").getUser().getEmail(),
					quantity: 1,
					netamount: parseInt(oData.unitPrice)
				};
			oModel.create("/cartItems", oCartData, {
				success: function (response) {
					callback(true, {});
				},
				error: function (oError) {
					callback(false, oError);
				}
			});
		},

		onUpdateCartItem: function (oComponent, oData, callback) {
			var oModel = oComponent.oOwnerComponent.getModel(),
				oCartData = {
					quantity: parseInt(oData.quantity),
					shipVia: oData.oTableData.shipVia,
					products_productID: parseInt(oData.oTableData.products_productID),
					customers_customerID: oData.oTableData.customers_customerID
				};
			oModel.update("/cartItems" + "/" + oData.oTableData.ID, oCartData, {
				success: function () {
					callback(true);
				},
				error: function (oError) {
					callback(false);
				}
			});
		},

		onRemoveFromCart: function (oComponent, value, callback) {
			var oModel = oComponent.oOwnerComponent.getModel();
			oModel.remove("/cartItems" + "/" + value, {
				success: function (response) {
					callback(true);
				},
				error: function (oError) {
					callback(false);
				}
			});
		},

		onOrderItems: function (oComponent, callback) {
			var oModel = oComponent.oOwnerComponent.getModel(),
				cartData = [],
				oData = oComponent.aData,
				today = new Date(Date.now());
			for (var i = 0; i < oData.length; i++) {
				cartData.push({
					"products_productID": oData[i] ? oData[i].products_productID : null,
					"customer_customerID": oData[i] ? oData[i].customer_customerID : null,
					"quantity": oData[i] ? oData[i].quantity : null,
					"shipVia": oData[i] ? oData[i].shipVia : null,
					"netamount": oData[i] ? oData[i].netamount : null
				});
			}

			var oOrderData = {
				"OrderNo": oComponent.oFLPModel.getProperty("/orderNo"),
				"orderDate": today,
				"order_status": "ordered",
				"requiredDate": oComponent.oFLPModel.getProperty("/setDate"),
				"shippedDate": today,
				"customer_customerID": sap.ushell.Container.getService("UserInfo").getUser().getEmail(),
				"employee_employeeID": 1,
				"price": oComponent.oFLPModel.getProperty("/checkoutTotal"),
				"ShippingAddress": {
					"street": "w3, kulala street"
				},
				"items": cartData
			};
			oModel.create("/Orders", oOrderData, {
				success: function (response) {
					callback(true);
				},
				error: function (oError) {
					callback(false);
				}
			});
		},

		onUpdateshippingDetails: function (oComponent, callback) {
			var oModel = oComponent.oOwnerComponent.getModel(),
				oData = {
					"custID": sap.ushell.Container.getService("UserInfo").getUser().getEmail(),
					"ship_mode": oComponent.sSelectedKey || "TR"
				};
			oModel.create("/UpdateShippingdetails", oData, {
				success: function (response) {
					callback(true, {});
				},
				error: function (oError) {
					callback(false, oError);
				}
			});
		},

		onCancelorder: function (oComponent, callback) {
			var oModel = oComponent.oOwnerComponent.getModel(),
				oData = {
					"ID": oComponent.ID,
					"reason": "Review is Poor. So cancelling the Item"
				};
			oModel.create("/cancelOrder", oData, {
				success: function (response) {
					callback(true);
				},
				error: function (oError) {
					callback(false);
				}
			});
		},

		// bindViewData: function (oComponent, callback) {
		// 	oComponent.oModel.read("/cartItems", {
		// 		urlParameters: {
		// 			"$expand": "products"
		// 		},
		// 		success: function (response) {
		// 			callback(response);
		// 		},
		// 		error: function (oError) {
		// 			callback({});
		// 		}
		// 	});
		// },
	};
});