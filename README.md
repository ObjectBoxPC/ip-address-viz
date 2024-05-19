# IP Address Space Visualization

This is a visualization of the space of IP address allocations, for both IPv6 and IPv4. A [live version](https://objectboxpc.github.io/ip-address-viz/) is available.

Address allocations are published by the [Internet Assigned Numbers Authority](https://www.iana.org/numbers) (IANA).

## Data Format

The `blocks-*.json` files contain the data for the various allocations. These allocations are represented as a hierarchy of blocks.

Each file contains a top-level array of blocks, which are objects with the following format:

* **prefix**: Prefix in CIDR format
* **type**: Type of block. Possible values are:
	* **rir**: Regional Internet registry (RIR) allocation for global unicast
	* **org**: "Legacy" IPv4 allocation to an organization
	* **reserved**: Reserved (or not allocated)
	* **special**: Special allocation (not for global unicast)
	* **deprecated**: Deprecated allocation
	* **various**: Various allocations in subblocks, or a single allocation that does not occupy the entire block
* **description**: Description of the block (may be omitted for various-type blocks)
* **subblocks**: Subblocks (if applicable)

Each level contains 16 blocks (4 bits of the address prefix), and the hierarchy is currently limited to /12.

## License

The contents of this repository are available under the MIT License. Refer to `LICENSE.txt` for details.