'use strict';

(function (d3) {
	function identity(x) {
		return x;
	}

	function chunk(arr, chunkSize) {
		return d3.range(Math.ceil(arr.length / chunkSize))
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

	function buildDataRow(rowData) {
		var row = d3.select(this);
		if (rowData.type === 'various') {
			row
				.selectAll('td')
				.data(rowData.subblocks)
				.join('td')
				.each(function (d) {
					var block = d3.select(this);
					if (d.type === 'various') {
						block.classed('block-fine', true);
						block
							.append('table')
							.selectAll('tr')
							.data(chunk(d.subblocks, fineGridColumns))
							.join('tr')
							.selectAll('td')
							.data(identity)
							.join('td')
							.each(function (fd) { d3.select(this).classed('block-' + fd.type, true); });
						block
							.append('div')
							.classed('block-fine-overlay', true)
							.text(d.description)
							.attr('title', d.prefix);

					} else {
						block
							.classed('block-small block-' + d.type, true)
							.text(function (d) { return d.description; })
							.attr('title', function (d) { return d.prefix; });
					}
				});
		} else {
			row
				.append('td')
				.attr('colspan', gridColumns)
				.classed('block-large block-' + rowData.type, true)
				.text(rowData.description)
				.attr('title', function (d) { return d.prefix; });
		}
	}

	var table = d3.select('main').append('table');
	var headerRow = table.append('tr');
	headerRow.append('th');
	headerRow
		.selectAll('th').filter(function (_, i) { return i > 0; })
		.data(d3.range(gridColumns).map(slashEightColumnHeader))
		.join('th')
		.text(identity);

	d3.json('blocks.json')
		.then(function (blocks) {
			var dataRows = table
				.selectAll('tr').filter(function (_, i) { return i > 0; })
				.data(blocks)
				.join('tr');
			dataRows
				.append('th')
				.datum(function (_, i) { return slashFourRowHeader(i); })
				.text(identity);
			dataRows.each(buildDataRow);
		});
})(d3);