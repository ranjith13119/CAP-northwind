sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"HTML/HTML/model/models",
	'sap/f/library',
	'sap/ui/model/json/JSONModel',
	'sap/f/FlexibleColumnLayoutSemanticHelper',
], function (UIComponent, Device, models, fioriLibrary, JSONModel, FlexibleColumnLayoutSemanticHelper) {
	"use strict";

	return UIComponent.extend("HTML.HTML.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			var oRouter, oModel; // call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			oModel = new JSONModel();
			this.setModel(oModel, "FLP");
			this.getModel("FLP").setProperty("/checkoutTotal", 0);
			oRouter = this.getRouter();
			oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
			oRouter.initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// enable routing
			this.getRouter().initialize();
		},

		getHelper: function () {
			return this._getFcl().then(function (oFCL) {
				var oSettings = {
					defaultTwoColumnLayoutType: fioriLibrary.LayoutType.TwoColumnsMidExpanded,
					defaultThreeColumnLayoutType: fioriLibrary.LayoutType.ThreeColumnsMidExpanded
				};
				return (FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings));
			});
		},

		_onBeforeRouteMatched: function (oEvent) {
			var oModel = this.getModel("FLP"),
				sLayout = oEvent.getParameters().arguments.layout,
				oNextUIState;

			// If there is no layout parameter, set a default layout (normally OneColumn)
			if (!sLayout) {
				this.getHelper().then(function (oHelper) {
					oNextUIState = oHelper.getNextUIState(0);
					oModel.setProperty("/layout", oNextUIState.layout);
				});
				return;
			}

			oModel.setProperty("/layout", sLayout);
		},

		_getFcl: function () {
			return new Promise(function (resolve, reject) {
				var oFCL = this.getRootControl().byId('flexibleColumnLayout');
				if (!oFCL) {
					this.getRootControl().attachAfterInit(function (oEvent) {
						resolve(oEvent.getSource().byId('flexibleColumnLayout'));
					}, this);
					return;
				}
				resolve(oFCL);
			}.bind(this));
		}
	});
});