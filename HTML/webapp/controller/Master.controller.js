sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/m/MessageToast",
	"HTML/HTML/model/models"
], function (Controller, Filter, FilterOperator, Sorter, MessageToast, models) {
	"use strict";

	return Controller.extend("HTML.HTML.controller.Master", {

		onInit: function () {
			this.oView = this.getView();
			this._bDescendingSort = false;
			this.oProductsTable = this.oView.byId("productsTable");
			this.oOwnerComponent = this.getOwnerComponent();
			this.oRouter = this.oOwnerComponent.getRouter();
		},

		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter("productName", FilterOperator.Contains, sQuery)];
			}

			this.oProductsTable.getBinding("items").filter(oTableSearchState, "Application");
		},
		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oBinding = this.oProductsTable.getBinding("items"),
				oSorter = new Sorter("productName", this._bDescendingSort);
			oBinding.sort(oSorter);
		},
		onListItemPress: function (oEvent) {
			var productPath = oEvent.getSource().getBindingContext().getPath(),
				product = productPath.split("/").slice(-1).pop(),
				oNextUIState;

			this.getOwnerComponent().getHelper().then(function (oHelper) {
				oNextUIState = oHelper.getNextUIState(1);
				this.oRouter.navTo("detail", {
					layout: oNextUIState.layout,
					product: product
				});
			}.bind(this));
		},
		onCartPress: function (oEvent) {
			var oNextUIState;
			this.oOwnerComponent.getHelper().then(function (oHelper) {
				oNextUIState = oHelper.getNextUIState(3);
				this.oRouter.navTo("cart", {
					layout: oNextUIState.layout
				});
			}.bind(this));
		},
		onHistoryPress: function (oEvent) {
			var oNextUIState;
			this.oOwnerComponent.getHelper().then(function (oHelper) {
				oNextUIState = oHelper.getNextUIState(5);
				this.oRouter.navTo("orderHistory", {
					layout: oNextUIState.layout
				});
			}.bind(this));
		},
		_getDialog: function () {

			if (!this.dialog) {
				this.dialog = sap.ui.xmlfragment("idFragment", "HTML.HTML.view.AddProducts", this);
				this.oView.addDependent(this.dialog);
			}

			return this.dialog;
		},
		onSupplierHandleChange: function (oEvent) {
			var oValidatedComboBox = oEvent.getSource();
			this.sSelectedSupplierKey = oValidatedComboBox.getSelectedKey();
		},
		onCategoryHandleChange: function (oEvent) {
			var oValidatedComboBox = oEvent.getSource();
			this.sSelectedCategoryKey = oValidatedComboBox.getSelectedKey();
		},
		onAdd: function () {
			this._getDialog().open();
		},
		onRefresh: function (that) {
			this.oProductsTable.getBinding("items").refresh();
		},
		onCreate: function () {
			this.onCancel();
			this.oProductData = {
				"productName": sap.ui.getCore().byId("idFragment--idProductName").getValue() || sap.ushell.Container.getService("UserInfo").getUser()
					.getEmail(),
				"productID": parseInt(sap.ui.getCore().byId("idFragment--idProduct").getValue()) || 212,
				"describtion": sap.ui.getCore().byId("idFragment--idDescription").getValue() || "",
				"quantityPerUnit": sap.ui.getCore().byId("idFragment--quantityPerUnit").getValue() || 1,
				"unitPrice": parseFloat(sap.ui.getCore().byId("idFragment--unitPrice").getValue()) || 0.00,
				"unitsInStock": parseInt(sap.ui.getCore().byId("idFragment--unitsInStock").getValue()) || 1,
				"discontinued": false,
				"supplier_supplierID": parseInt(this.sSelectedSupplierKey) || 1,
				"category_categoryID": parseInt(this.sSelectedCategoryKey) || 1
			};
			var callback = function (res) {
				if (res) {
					this.onRefresh();
					MessageToast.show("Created Successfully");
				} else {
					MessageToast.show("Couldn't Create the product");
				}
			}.bind(this);
			models.createProducts(this, callback);
		},
		onCancel: function () {
			this._getDialog().close();
		},
		onExit: function () {
			this._getDialog().destroy(true);
		}
	});
});