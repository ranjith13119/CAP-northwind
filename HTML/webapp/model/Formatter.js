sap.ui.define(function () {
	"use strict";

	var Formatter = {
		getBusyDialog: function () {
			return new sap.m.BusyDialog();
		},
		closeBusyDialog: function () {
			this.getBusyDialog.close();
		},
		openBusyDialog: function () {
			this.getBusyDialog.open();
		}
	};
	return Formatter;
}, true);