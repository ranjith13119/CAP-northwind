sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"HTML/HTML/model/models",
	"sap/m/MessageToast"
], function (JSONModel, Controller, models, MessageToast) {
	"use strict";

	return Controller.extend("HTML.HTML.controller.orderHistory", {

		onInit: function () {
			this.oOwnerComponent = this.getOwnerComponent();
			this.oView = this.getView();
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oModel = this.oOwnerComponent.getModel("FLP");
			this.oRouter.getRoute("orderHistory").attachPatternMatched(this._onHistoryAttachMatched, this);
			this.count = 0;
		},
		_onHistoryAttachMatched: function () {
			if (this.count > 0) {
				this.getView().byId("idList").getBinding("items").refresh();
			}
			this.count++;
		},
		oncancelpress: function (oEvent) {
			if (oEvent.getSource().getBindingContext().getObject()) {
				this.ID = oEvent.getSource().getBindingContext().getObject().ID;
				var callback = function (response) {
					if (response) {
						this._onHistoryAttachMatched();
						MessageToast.show("Order Canceled Successfully");
					} else {
						MessageToast.show("Couldn't Cancel the Order. Because it is already canceled!");
					}
				}.bind(this);
				models.onCancelorder(this, callback);
			}

		},
		onExit: function () {
			this.oRouter.getRoute("orderHistory").detachPatternMatched(this._onHistoryAttachMatched, this);
		}

	});

});