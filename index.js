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

	function buildTableHeader(table) {
		var headerRow = table.append('thead').append('tr');
		headerRow.append('td');
		headerRow
			.selectAll('th')
			.data(d3.range(gridColumns).map(slashEightColumnHeader))
			.join('th')
			.attr('scope', 'col')
			.text(identity);
	}

	function buildTableBody(table, data) {
		table
			.append('tbody')
			.selectAll('tr')
			.data(data)
			.join('tr')
			.each(buildDataRow);
	}

	function buildDataRow(data, i) {
		var row = d3.select(this);
		row
			.append('th')
			.attr('scope', 'row')
			.datum(slashFourRowHeader(i))
			.text(identity);
		if (data.type === 'various') {
			buildComplexRow(row, data);
		} else {
			buildSimpleRow(row, data);
		}
	}

	function buildComplexRow(row, data) {
		row
			.selectAll('td')
			.data(data.subblocks)
			.join('td')
			.each(function (d) {
				var cell = d3.select(this);
				if (d.type === 'various') {
					buildComplexCell(cell, d);
				} else {
					buildSimpleCell(cell, d);
				}
			});
	}

	function buildComplexCell(cell, data) {
		cell.classed('block-fine', true);
		cell
			.append('table')
			.selectAll('tr')
			.data(chunk(data.subblocks, fineGridColumns))
			.join('tr')
			.selectAll('td')
			.data(identity)
			.join('td')
			.attr('class', function (d) { return 'block-' + d.type; });
		cell
			.append('div')
			.classed('block-fine-overlay', true)
			.text(data.description)
			.attr('title', data.prefix);
	}

	function buildSimpleCell(cell, data) {
		cell
			.classed('block-small block-' + data.type, true)
			.text(data.description)
			.attr('title', data.prefix);
	}

	function buildSimpleRow(row, data) {
		row
			.append('td')
			.attr('colspan', gridColumns)
			.classed('block-large block-' + data.type, true)
			.text(data.description)
			.attr('title', data.prefix);
	}

	var table = d3.select('main').append('table');
	buildTableHeader(table);
	d3.json('blocks.json')
		.then(function (data) {
			buildTableBody(table, data);
		});
})(d3);