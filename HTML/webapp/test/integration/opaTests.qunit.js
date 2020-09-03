/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"HTML/HTML/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});