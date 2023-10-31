exports.install = function() {
	ROUTE('+GET /');
	ROUTE('+GET /preview/');
	ROUTE('+POST /render/', 'render');
};