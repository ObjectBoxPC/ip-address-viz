'use strict';

(function (document, preact, preactHooks) {
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

	function slashFourRowHeader(i) {
		return i.toString(16) + '000::/4';
	}

	function slashEightColumnHeader(i) {
		return 'x' + i.toString(16) + '00::/8';
	}

	function DataTable() {
		var dataState = preactHooks.useState([]);

		preactHooks.useEffect(function () {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', 'blocks.json');
			xhr.addEventListener('load', function () {
				var data = JSON.parse(xhr.responseText);
				dataState[1](data);
			});
			xhr.send();
		}, []);

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
						slashEightColumnHeader(i)
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
				slashFourRowHeader(props.index)
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

	preact.render(h(DataTable), document.getElementsByTagName('main')[0]);
})(document, preact, preactHooks);