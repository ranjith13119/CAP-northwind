sap.ui.define([
	"sap/m/BusyDialog"
], function (BusyDialog) {
	"use strict";

	var common = {
		getBusyDialog: function () {
			return new BusyDialog();
		},
		closeBusyDialog: function () {
			this.getBusyDialog().close();
		},
		openBusyDialog: function () {
			this.getBusyDialog().open();
		}
	};
	return common;
}, true);