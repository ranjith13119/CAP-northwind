sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"HTML/HTML/model/models",
	"sap/m/MessageToast"
], function (Controller, models, MessageToast) {
	"use strict";

	return Controller.extend("HTML.HTML.controller.cart", {
		onInit: function () {
			this.oOwnerComponent = this.getOwnerComponent();
			this.oView = this.getView();
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oModel = this.oOwnerComponent.getModel("FLP");
			this.oRouter.getRoute("cart").attachPatternMatched(this._onCartAttachMatched, this);
			this.cartCount = 0;
		},

		handleUploadPress: function () {
			var oFileUploader = this.byId("fileUploader");
			oFileUploader.upload();
		},

		handleUploadPress: function (oEvent) {
			var imageUploader = this.getView().byId("fileUploader");
			var domRef = imageUploader.getFocusDomRef();
			var file = domRef.files[0];
			this.fileName = file.name;
			this.fileType = file.type;
			var reader = new FileReader();
			var onRequestCallback = function (res) {
				if (res) {
					MessageToast.show("Uploaded Successfully!")
				} else {
					MessageToast.show("Upload failed");
				}
			}
			reader.onload = function (e) {
				// get an access to the content of the file
				//this.content = e.currentTarget.result.replace("data:image/png;base64,", "");
				this.content = e.currentTarget.result
				models.onImageUpload(this, onRequestCallback);

			}.bind(this);
			reader.readAsDataURL(file);
		},

		_onCartAttachMatched: function () {
			if (this.cartCount > 0) {
				this.getView().byId("cartTable").getBinding("items").refresh();
			}
			this.cartCount++;
		},
		onUpdateFinished: function (oEvent) {
			var oTable = this.getView().byId("cartTable"),
				total = 0,
				aData = (oTable.getItems() || []).map(function (oItem) {
					return oItem.getBindingContext().getObject();
				});
			for (var i = 0; i < aData.length; i++) {
				total += aData[i] ? aData[i].netamount : 0;
			}
			this.oModel.setProperty("/checkoutTotal", total);
			this.oModel.refresh();
		},
		onChange: function (oEvent) {
			var oTableData = oEvent.getSource().getBindingContext().getObject(),
				quantity = (oEvent.getParameter("value")),
				oData = {
					oTableData: oTableData,
					quantity: quantity
				},
				onRequestCallback = function (response) {
					if (!response) {
						MessageToast.show("Couldn't update the cart details. Please update it again!");
					} else {
						this.onUpdateFinished();
						MessageToast.show("Updated Successfully");
					}
				}.bind(this);
			models.onUpdateCartItem(this, oData, onRequestCallback);
		},
		onCheckout: function (oEvent) {
			var oNextUIState;
			this.oOwnerComponent.getHelper().then(function (oHelper) {
				oNextUIState = oHelper.getNextUIState(4);
				this.oRouter.navTo("checkout", {
					layout: oNextUIState.layout,
					ID: 1
				});
			}.bind(this));
		},
		handleChange: function (oEvent) {
			var oValidatedComboBox = oEvent.getSource();
			this.sSelectedKey = oValidatedComboBox.getSelectedKey();
		},
		onCancelPress: function (oEvent) {
			var id = oEvent.getSource().getBindingContext().getObject().ID;
			var onRequestCallback = function (response) {
				if (response) {
					this.onUpdateFinished();
					MessageToast.show("Successfully Removed from cart");
				} else {
					MessageToast.show("Item is Removed from cart. Please try again!");
				}
			}.bind(this);
			models.onRemoveFromCart(this, id, onRequestCallback);
		},
		onUpdate: function (oEvent) {
			if (this.getView().byId("cartTable").getItems().length > 0) {
				var callback = function (res, response) {
					if (res) {
						this.onUpdateFinished();
						MessageToast.show("Shipping Details Updated Successfully");
					} else if (!res && response.error) {
						MessageToast.show(response.error.message);
					}
				}.bind(this);
				models.onUpdateshippingDetails(this, callback);
			}
		},
		onExit: function () {
			this.oRouter.getRoute("cart").detachPatternMatched(this._onCartAttachMatched, this);
		}
	});
});