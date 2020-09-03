sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"HTML/HTML/model/models",
	"sap/m/MessageToast",
	"HTML/HTML/model/common"
], function (Controller, models, MessageToast, common) {
	"use strict";

	return Controller.extend("HTML.HTML.controller.Detail", {

		onInit: function () {
			this.oOwnerComponent = this.getOwnerComponent();
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oModel = this.oOwnerComponent.getModel("FLP");
			this.oRouter.getRoute("master").attachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
		},

		_onProductMatched: function (oEvent) {
			this._product = oEvent.getParameter("arguments").product || this._product || "1";
			this.getView().bindElement({
				path: "/" + this._product,
				parameters: {
					expand: "category,supplier"
				}
			});
		},

		onCartPress: function (oEvent) {
			var that = this;
			var onRequestcomplete = function (res, response) {
				if (res) {
					that.oModel.setProperty("/cartbtnVisible", false);
					MessageToast.show("Item is added to cart.");
				} else {
					if (response.statusText == "Conflict" && response.statusCode == "409") {
						MessageToast.show("Item is already available in your cart list");
					} else {
						MessageToast.show("Item is not added to cart. Please try again!");
					}
				}
			};

			models.onAddTocart(this, onRequestcomplete);
		},

		onShare: function (oEvent) {
			var sEmail = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
			sap.m.URLHelper.triggerEmail(sEmail, "Product Details", JSON.stringify(this.getView().getModel().getProperty("/" + this._product)));
			MessageToast.show("could not send the Email. Please open your outlook before send a email!");
		},

		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {
				layout: sNextLayout,
				product: this._product
			});
		},

		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {
				layout: sNextLayout,
				product: this._product
			});
		},

		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {
				layout: sNextLayout
			});
		},
		onExit: function () {
			this.oRouter.getRoute("master").detachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detail").detachPatternMatched(this._onProductMatched, this);
		}
	});

});