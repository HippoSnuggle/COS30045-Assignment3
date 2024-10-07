function init() {
    // Set up dimensions
    const width = 1154, height = 1154;

    // Create an SVG container
    const svg = d3.select("#visualisation2")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(0,0)");

    console.log("SVG container created:", svg);

    // Create a div for the tooltip
    const tooltip = d3.select("#tooltip");

    // Define the treemap layout with square-like tiles
    const treemapLayout = d3.treemap()
                            .tile(d3.treemapSquarify)  // Use squarified layout
                            .size([width, height])
                            .padding(1);

    // Define a color scale for nodes
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    let data = {};  // Loaded data goes here

    // Load the data from the JSON file
    d3.json("data/visualisation2/final_dataset.json").then(dataset => {
        console.log("Data loaded:", dataset);
        data = dataset;

        // Populate the country and year dropdowns
        const countries = Object.keys(data);
        const countrySelect = d3.select("#country");
        const yearSelect = d3.select("#year");

        // Add countries to the dropdown
        countrySelect.selectAll("option")
                     .data(countries)
                     .enter()
                     .append("option")
                     .text(d => d)
                     .attr("value", d => d);

        // Initialize with the first country and year
        const initialCountry = countries[0];
        const years = data[initialCountry].years.map(d => d.year);

        // Add years to the dropdown for the selected country
        yearSelect.selectAll("option")
                  .data(years)
                  .enter()
                  .append("option")
                  .text(d => d)
                  .attr("value", d => d);

        // Render the initial treemap
        updateTreemap(initialCountry, years[0]);

        // Add event listeners for when the country or year is changed
        countrySelect.on("change", function() {
            const selectedCountry = this.value;
            const selectedYear = yearSelect.node().value;
            updateYearDropdown(selectedCountry);  // Update year dropdown for the selected country
            updateTreemap(selectedCountry, selectedYear);
        });

        yearSelect.on("change", function() {
            const selectedCountry = countrySelect.node().value;
            const selectedYear = this.value;
            updateTreemap(selectedCountry, selectedYear);
        });

        // Function to update the year dropdown when a country is selected
        function updateYearDropdown(country) {
            const years = data[country].years.map(d => d.year);
            yearSelect.selectAll("option").remove();  // Clear old options
            yearSelect.selectAll("option")
                      .data(years)
                      .enter()
                      .append("option")
                      .text(d => d)
                      .attr("value", d => d);
        };

        // Function to update the treemap
        function updateTreemap(country, year) {
            const hierarchyData = buildHierarchyExcludingZeroes(data[country], year);

            const root = d3.hierarchy(hierarchyData)
                          .sum(d => d.total)
                          .sort((a, b) => b.value - a.value);

            treemapLayout(root);

            // Remove old nodes
            svg.selectAll(".node").remove();

            // Create nodes
            const nodes = svg.selectAll(".node")
                            .data(root.leaves())
                            .enter()
                            .append("g")
                            .attr("class", "node")
                            .attr("transform", d => `translate(${d.x0},${d.y0})`);

            // Append rectangles for each node
            nodes.append("rect")
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("fill", d => color(d.parent.data.name))
                .on("mouseover", (event, d) => {
                    // Show the tooltip
                    tooltip.style("visibility", "visible")
                            .html(`<strong>${d.data.name}</strong><br>Total: ${d.data.total}`);
                })
                .on("mousemove", (event) => {
                    // Move the tooltip to follow the mouse
                    tooltip.style("top", `${event.pageY + 10}px`)
                            .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => {
                    // Hide the tooltip
                    tooltip.style("visibility", "hidden");
                });

            // Append text labels to nodes
            nodes.append("text")
                .attr("x", 5)
                .attr("y", 20)
                .text(d => d.data.name);
        };

        // Function to build hierarchy for the treemap, excluding 0 totals
        function buildHierarchyExcludingZeroes(countryData, year) {
            // Find the data for the selected year
            const yearData = countryData.years.find(d => d.year == year);

            if (!yearData) return null;  // Return null if no year data is found

            // Filter and map causes, excluding any cause with total = 0
            const causes = yearData.causes
                .filter(cause => cause.total > 0)  // Only include causes with total > 0
                .map(cause => {
                    // Filter and map subcauses, excluding any subcause with total = 0
                    const subCauses = cause.subCauses
                        ? cause.subCauses
                            .filter(subCause => subCause.total > 0)  // Only include subcauses with total > 0
                            .map(subCause => {
                                // Filter and map subsubcauses, excluding any subsubcause with total = 0
                                const subSubCauses = subCause.subSubCauses
                                    ? subCause.subSubCauses
                                        .filter(subSubCause => subSubCause.total > 0)  // Only include subsubcauses with total > 0
                                        .map(subSubCause => ({
                                            name: subSubCause.cause,
                                            total: subSubCause.total
                                        }))
                                    : [];

                                return {
                                    name: subCause.cause,
                                    total: subCause.total,
                                    children: subSubCauses.length > 0 ? subSubCauses : null  // Only include children if non-empty
                                };
                            })
                        : [];

                    return {
                        name: cause.cause,
                        total: cause.total,
                        children: subCauses.length > 0 ? subCauses : null  // Only include children if non-empty
                    };
                });

            // Return the hierarchy structure for the year, ensuring we exclude empty children arrays
            return {
                name: `Year ${year}`,
                children: causes.length > 0 ? causes : null  // Only include children if non-empty
            };
        };
    }).catch(error => {
        console.error("Error loading the JSON file:", error);
    });
}

init();  // Call the init function to set up the visualisation