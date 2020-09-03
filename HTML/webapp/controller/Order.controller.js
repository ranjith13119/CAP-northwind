sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"HTML/HTML/model/models",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/BusyDialog",
	"HTML/HTML/model/common"
], function (Controller, models, MessageToast, JSONModel, BusyDialog, common) {
	"use strict";

	return Controller.extend("HTML.HTML.controller.Order", {

		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oOwnerComponent = this.getOwnerComponent();
			this.oFLPModel = this.oOwnerComponent.getModel("FLP");
			this.oModel = this.oOwnerComponent.getModel();
			this.oRouter.getRoute("checkout").attachPatternMatched(this._onOrderAttachMatched, this);
			this.orderCount = 0;
			this.oFLPModel.setProperty("/orderNo", "");
			this.oFLPModel.setProperty("/setDate", Date.now());
		},

		_onOrderAttachMatched: function (oEvent) {
			if (this.orderCount > 0) {
				this.getView().byId("reviewOrdertable").getBinding("items").refresh();
			}
			this.orderCount++;
		},

		onUpdateFinished: function (oEvent) {
			var oTable = this.getView().byId("reviewOrdertable"),
				total = 0,
				aData = (oTable.getItems() || []).map(function (oItem) {
					return oItem.getBindingContext().getObject();
				});
			for (var i = 0; i < aData.length; i++) {
				total += aData[i] ? aData[i].netamount : 0;
			}
			this.oFLPModel.setProperty("/checkoutTotal", total);
			this.oFLPModel.refresh();
		},

		onliveChange: function (oEvent) {
			var value = oEvent.getParameters().value;
			if (!(/^[a-zA-Z0-9]*$/.test(value))) {
				MessageToast.show("Special Characters are not allowed");
			} else if (value.length > 10) {
				MessageToast.show("OrderNo. couldn't be greater than 10 charactes");
			}
		},

		onOrderItems: function (OEvent) {
			var value = this.getView().getModel("FLP").getData().orderNo;
			if (value && this.getView().byId("reviewOrdertable").getItems().length > 0) {
				if (value.length <= 0 || value.length > 10 || !(/^[a-zA-Z0-9]*$/.test(value))) {
					MessageToast.show("Please enter Valid OrderNo.");
					return;
				}
				var oTable = this.getView().byId("reviewOrdertable");
				this.aData = (oTable.getItems() || []).map(function (oItem) {
					return oItem.getBindingContext().getObject();
				});
				var onRequestcallBack = function (response) {
					if (response) {
						this._onOrderAttachMatched();
						MessageToast.show("Ordered Successfully. OrderNo." + value);
					} else {
						MessageToast.show("Couldn't Order the" + value);
					}
				}.bind(this);
				models.onOrderItems(this, onRequestcallBack);
			} else {
				MessageToast.show("If you have data in the table then please enter the 'Order Number'. Else Add the data to Order.");
			}
		},
		onExit: function () {
			this.oRouter.getRoute("checkout").detachPatternMatched(this._onOrderAttachMatched, this);
		}
	});
});