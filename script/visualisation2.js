function init() {
    // Set up dimensions
    const width = 1200;
    const height = 800;

    // Create an SVG container
    var svg = d3.select("#visualisation2")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("g")
                    .attr("transform", "translate(0,0)");

    console.log("SVG container created:", svg);

    // Create a div for the tooltip
    var tooltip = d3.select("#tooltip");

    // Define the treemap layout with square-like tiles
    const treemapLayout = d3.treemap()
                            .tile(d3.treemapSquarify)  // Use squarified layout, treemap specific.
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
        const countries = Object.keys(data);                            // Get the countries from the data, very important
        var countrySelect = d3.select("#country");                      // Get the country from the dropdown       
        var yearSelect = d3.select("#year");                            // Get the year from the dropdown

        // Add countries to the dropdown
        countrySelect.selectAll("option")
                     .data(countries)
                     .enter()
                     .append("option")
                     .text(d => d)
                     .attr("value", d => d);

        // Initialize with the first country and year
        const initialCountry = countries[0];            // Get the first country            
        const years = data[initialCountry].years.map(d => d.year);      // Get the years for the first country

        // Add years to the dropdown for the selected country
        yearSelect.selectAll("option")
                  .data(years)
                  .enter()
                  .append("option")
                  .text(d => d)
                  .attr("value", d => d);

        // Render the initial treemap
        updateTreemap(initialCountry, years[0]);                        // Render the treemap for the first country and year

        // Add event listeners for when the country or year is changed
        countrySelect.on("change", function() {
            var selectedCountry = this.value;
            var selectedYear = yearSelect.node().value;
            updateYearDropdown(selectedCountry);            // Update year dropdown for the selected country
            updateTreemap(selectedCountry, selectedYear);
        });

        yearSelect.on("change", function() {
            const selectedCountry = countrySelect.node().value;         // Get the selected country
            const selectedYear = this.value;                            // Get the selected year
            updateTreemap(selectedCountry, selectedYear);               // Update the treemap for the selected country and year
        });

        // Function to update the year dropdown when a country is selected
        function updateYearDropdown(country) {
            var years = data[country].years.map(d => d.year);         // Get the years for the selected country
            yearSelect.selectAll("option").remove();                    // Clear old options
            yearSelect.selectAll("option")
                      .data(years)
                      .enter()
                      .append("option")
                      .text(d => d)
                      .attr("value", d => d);
        };

        // Function to update the treemap
        function updateTreemap(country, year) {
            const hierarchyData = buildHierarchy(data[country], year);               // Build the hierarchy data for the selected country and year, custom function below

            const root = d3.hierarchy(hierarchyData)                    // Create a hierarchy from the data, this is needed to work with the structured JSON dataset     
                          .sum(d => d.total)                            // Sum the total values for each node for placement and sizing in the treemap
                          .sort((a, b) => b.value - a.value);           // Sort the nodes by value, largest first, again for placement and sizing

            treemapLayout(root);                                // Apply the treemap layout to the hierarchy            

            // Remove old nodes when there's an update of country or year
            svg.selectAll(".node").remove();

            // Create nodes
            var nodes = svg.selectAll(".node")
                            .data(root.leaves())                                        // Get the leaf nodes, which are the lowest level nodes in the hierarchy, treemap specific
                            .enter()
                            .append("g")
                        .attr("class", "node")                                          // Add a class for styling, from the stylesheet
                            .attr("transform", d => `translate(${d.x0},${d.y0})`);      // Translate the nodes to their x0, y0 positions as calculated by the treemap layout according to their values

            // Append rectangles for each node, standard stuff
            nodes.append("rect")
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("fill", d => color(d.parent.data.name))
                .on("mouseover", (event, d) => {
                    // Show the tooltip
                    tooltip.style("visibility", "visible")
                            .html(`<strong>${d.data.name}</strong><br>Total: ${d.data.total}`);     // Set the tooltip text to show the cause and total, the cause is too long and label overlaps.
                })  
                .on("mousemove", (event) => {                                                       // Tooltip follows the mouse x and y position
                    // Move the tooltip to follow the mouse
                    tooltip.style("top", `${event.pageY + 10}px`)
                            .style("left", `${event.pageX + 10}px`);
                })
                .on("mouseout", () => {
                    // Hide the tooltip
                    tooltip.style("visibility", "hidden");
                });

            // Append text labels to nodes
            nodes.append("text")  // Append text to the nodes within the rectangle of the node, 5 pixels from the top left corner and 20 pixels down
                .attr("x", 5)
                .attr("y", 20)
                .text(d => d.data.name);
        };

        // Function to build hierarchy for the treemap, excluding 0 totals
        function buildHierarchy(countryData, year) {
            // Find the data for the selected year
            const yearData = countryData.years.find(d => d.year == year);

            if (!yearData) return null;  // Return null if no year data is found

            // Filter and map causes, excluding any cause with total = 0
            var causes = yearData.causes
                .filter(cause => cause.total > 0)  // Only include causes with total > 0
                .map(cause => {
                    // Filter and map subcauses, excluding any subcause with total = 0 to avoiding overcrowding the treemap with 0 values
                    var subCauses = cause.subCauses
                        ? cause.subCauses
                            .filter(subCause => subCause.total > 0)  // Only include subcauses with total > 0
                            .map(subCause => {
                                // Filter and map subsubcauses, excluding any subsubcause with total = 0
                                var subSubCauses = subCause.subSubCauses
                                    ? subCause.subSubCauses
                                        .filter(subSubCause => subSubCause.total > 0)  // Only include subsubcauses with total > 0
                                        .map(subSubCause => ({
                                            name: subSubCause.cause,
                                            total: subSubCause.total
                                        }))
                                    : [];

                                return {
                                    name: subCause.cause,                   // Return the subcause name if valid
                                    total: subCause.total,                  // Return the subcause total if valid
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

document.addEventListener("DOMContentLoaded", init);  // Ensure init is called after the DOM is fully loaded, for debugging but kinda useful so keeping it.