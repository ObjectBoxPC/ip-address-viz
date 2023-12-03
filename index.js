'use strict';

(function (document, window, preact, preactHooks) {
	var h = preact.h;

	function range(max) {
		var result = [];
		for (var i = 0; i < max; i++) {
			result.push(i);
		}
		return result;
	}

	function chunk(arr, chunkSize) {
		return range(Math.ceil(arr.length / chunkSize))
			.map(function (i) { return arr.slice(i * chunkSize, (i + 1) * chunkSize); });
	}

	var gridColumns = 16;
	var fineGridColumns = 4;

	var ipv6Config = {
		title: 'IPv6 Address Space Visualization',
		dataPath: 'blocks-v6.json',
		slashFourRowHeader: function (i) {
			return i.toString(16) + '000::/4';
		},
		slashEightColumnHeader: function (i) {
			return 'x' + i.toString(16) + '00::/8';
		},
	};

	var ipv4Config = {
		title: 'IPv4 Address Space Visualization',
		dataPath: 'blocks-v4.json',
		slashFourRowHeader: function (i) {
			return (i * gridColumns) + '.0.0.0/4';
		},
		slashEightColumnHeader: function (i) {
			return '+' + i + '.0.0.0/8';
		},
	};

	var ProtocolConfig = preact.createContext(ipv6Config);

	function App() {
		var hashState = preactHooks.useState('');
		function updateHashState() {
			hashState[1](window.location.hash);
		}
		preactHooks.useEffect(function () {
			updateHashState();
			window.addEventListener('hashchange', updateHashState);
			return function () {
				window.removeEventListener('hashchange', updateHashState);
			}
		}, []);

		switch (hashState[0]) {
		case '#ipv6':
			return h(
				Visualization,
				{ protocolConfig: ipv6Config }
			);
		case '#ipv4':
			return h(
				Visualization,
				{ protocolConfig: ipv4Config }
			);
		default:
			// TODO: Create chooser for visualizations
			return h(
				'div',
				null
			);
		}
	}

	function Visualization(props) {
		return h(
			ProtocolConfig.Provider,
			{ value: props.protocolConfig },
			h(
				PageTitle,
				{ title: props.protocolConfig.title }
			),
			h(
				DataTable,
				null
			)
		);
	}

	function PageTitle(props) {
		preactHooks.useEffect(function () {
			document.title = props.title;
		}, [props.title]);

		return h(
			'h1',
			null,
			props.title
		);
	}

	function DataTable() {
		var dataState = preactHooks.useState([]);
		var protocolConfig = preactHooks.useContext(ProtocolConfig);

		preactHooks.useEffect(function () {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', protocolConfig.dataPath);
			xhr.addEventListener('load', function () {
				var data = JSON.parse(xhr.responseText);
				dataState[1](data);
			});
			xhr.send();
		}, [protocolConfig]);

		return h(
			'table',
			null,
			h(
				DataTableHeader,
				null
			),
			h(
				DataTableBody,
				{ data: dataState[0] }
			)
		);
	}

	function DataTableHeader() {
		return h(
			'thead',
			null,
			h(
				'tr',
				null,
				h(
					'td',
					null
				),
				range(gridColumns).map(function (i) {
					return h(
						'th',
						{ scope: 'col', key: i },
						preactHooks.useContext(ProtocolConfig).slashEightColumnHeader(i)
					);
				})
			)
		);
	}

	function DataTableBody(props) {
		return h(
			'tbody',
			null,
			props.data.map(function (block, i) {
				return h(
					DataRow,
					{ data: block, index: i, key: block.prefix }
				)
			})
		);
	}

	function DataRow(props) {
		return h(
			'tr',
			null,
			h(
				'th',
				{ scope: 'row' },
				preactHooks.useContext(ProtocolConfig).slashFourRowHeader(props.index)
			),
			props.data.type === 'various'
				? h(
					ComplexDataRowContents,
					{ data: props.data }
				)
				: h(
					SimpleDataRowContents,
					{ data: props.data }
				)
		);
	}

	function ComplexDataRowContents(props) {
		return props.data.subblocks.map(function (block) {
			return block.type === 'various'
				? h(
					ComplexDataCell,
					{ data: block, key: block.prefix }
				)
				: h(
					SimpleDataCell,
					{ data: block, key: block.prefix }
				);
		});
	}

	function ComplexDataCell(props) {
		return h(
			'td',
			{
				title: props.data.prefix,
				'class': 'block-fine',
			},
			h(
				'table',
				null,
				chunk(props.data.subblocks, fineGridColumns)
					.map(function (blockChunk) {
						return h(
							'tr',
							null,
							blockChunk.map(function (block) {
								return h(
									'td',
									{ 'class': 'block-' + block.type }
								);
							})
						);
					})
			),
			h(
				'div',
				{
					'class': 'block-fine-overlay',
				},
				props.data.description
			)
		);
	}

	function SimpleDataCell(props) {
		return h(
			'td',
			{
				title: props.data.prefix,
				'class': 'block-small block-' + props.data.type
			},
			props.data.description
		);
	}

	function SimpleDataRowContents(props) {
		return h(
			'td',
			{
				colspan: gridColumns,
				title: props.data.prefix,
				'class': 'block-large block-' + props.data.type,
			},
			props.data.description
		);
	}

	preact.render(h(App, null), document.getElementsByTagName('main')[0]);
})(document, window, preact, preactHooks);