exports.install = function() {
	CORS('https://uibuilder.totaljs.com,https://preview.totaljs.com');
	ROUTE('FILE  /db.json', db);
	ROUTE('FILE  /templates.json', templates);
	ROUTE('POST    /uibuilder/', save);
	ROUTE('GET     /uibuilder/', list);
	ROUTE('DELETE  /uibuilder/', remove);
};

function db(req, res) {

	F.Fs.readdir(PATH.public('components'), function(err, response) {

		var obj = {};
		var arr = (CONF.uibuilder_components || '').split(',').trim();

		for (let i = 0; i < arr.length; i++) {
			if (arr[i])
				obj['cdn' + i] = arr[i];
		}

		if (response) {
			for (let m of response)
				obj[m] = '/components/{0}/editor.html';
		}

		res.json(obj);
	});

}

function templates(req, res) {

	F.Fs.readdir(PATH.public('templates'), function(err, response) {

		var arr = [];

		if (response) {
			response.wait(function(filename, next) {

				F.Fs.readFile(PATH.public('templates/' + filename), 'utf8', function(err, response) {
					response = response.parseJSON();
					arr.push({ id: filename.replace(/\.json$/g, ''), name: response.name, icon: response.icon, color: response.color, type: response.type });
					next();
				});

			}, function() {
				arr.quicksort('name');
				res.json(arr);
			});
		} else
			res.json(arr);

	});

}


function save() {
	var $ = this;
	var plus = ($.body.editor ? '' : '_compiled') + '.json';
	F.Fs.writeFile(PATH.public('data/' + $.body.id + plus), JSON.stringify($.body, null, '\t'), $.done(true));
}

function list() {
	var $ = this;

	F.Fs.readdir(PATH.public('data'), function(err, response) {

		var arr = [];
		var keys = { id: 1, name: 1, icon: 1, group: 1, reference: 1, description: 1, version: 1, type: 1, author: 1, color: 1 };

		response.wait(function(item, next) {

			var is = false;

			if ($.query.compiled)
				is = item.lastIndexOf('_compiled') !== -1;
			else
				is = item.lastIndexOf('_compiled') === -1;

			if (is) {
				F.Fs.readFile(PATH.public('data/' + item), 'utf8', function(err, response) {
					var data = JSON.parse(response);
					var obj = {};

					for (let key in keys)
						obj[key] = data[key];

					arr.push(obj);
					next();
				});
			} else
				next();

		}, () => $.json(arr), 2);

	});
}

function remove() {
	var $ = this;
	var id = $.query.id;
	if (id) {
		var arr = [];
		arr.push(PATH.public('data/{0}.json'.format(id)));
		arr.push(PATH.public('data/{0}_compiled.json'.format(id)));
		PATH.unlink(arr, $.done());
	} else
		$.invalid(404);
}