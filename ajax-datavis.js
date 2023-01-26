const urlJSON =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

document.addEventListener("DOMContentLoaded", function () {
  //  ---------------  GETTING DATA   ---------------
  const req = new XMLHttpRequest();
  req.open("GET", urlJSON, true);
  req.send();
  req.onload = function () {
    const json = JSON.parse(req.responseText);
    const keys = Object.keys(json);
    const dataset = json["data"];

    //  ---------------  GRAPH d3  ---------------
    //  ---------------  INITIALIZATION  ---------------
    // const w = 1200;
    // const h = 500;

var w = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  ),
   h = Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );

  w = w * 0.97;
  h = h * 0.90;


    const padding = 120;
    const paddingXLeft = 120;
    const paddingXRight = 30;
    const paddingYTop = paddingXRight;
    const paddingYBottom = 90;
    const bar_width = 5;

    // Xdataset AS Date type
    const Xdataset = dataset.map((d) => new Date(d[0]));
    const Xdataset_max = d3.max(Xdataset, (d) => d);
    const Xdataset_min = d3.min(Xdataset, (d) => d);

    const Ydataset = dataset.map((x) => x[1]);
    const Ydataset_max = d3.max(Ydataset, (d) => d);

    //  ---------------  SIZING AND SCALING  ---------------
    // d3.select("#chart").style("width", w+"px").style("height", h+"px");
    // d3.select("#chart").style("width", w+"px").style("height", h+"px");


    const scaleYEARS = d3
      .scaleTime()
      .domain([Xdataset_min, Xdataset_max])
      .range([paddingXLeft, w - paddingXRight]);

    const scaleGDP = d3
      .scaleLinear()
      .domain([0, Ydataset_max])
      .range([paddingYBottom, h - paddingYTop]);

    const YEARSscaled = Xdataset.map((x) => scaleYEARS(x));
    const GDPscaled = Ydataset.map((x) => scaleGDP(x));

    // ------------  SVG : INITIALIZING  ------------
    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

      svg.append("text")
      .attr("id", "title")
        .attr("x", (w / 2))             
        .attr("y", 0 + 30)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("font-weight", "600")
        .style("text-decoration", "underline")  
        .text("US GDP per quarter over years");

    // ------------  SVG : SETTINGS  ------------

    svg // one "<rect> .bar index" append for every GDPscaled points
      .selectAll("rect")
      .data(GDPscaled)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("index", (d, i) => i);

    svg // positioning and sizing of bars
      .selectAll("rect")
      .attr("x", (d, i) => YEARSscaled[i])
      .attr("y", (d, i) => h - d)
      .attr("width", bar_width)
      .attr("height", (d) => d - paddingYBottom);

    svg // adding data as rect properties (fcc requierement, but not useful here as far as I know)
      .selectAll("rect")
      .attr("data-date", (d, i) => dataset[i][0])
      .attr("data-gdp", (d, i) => dataset[i][1]);

    svg // tooltip appearance on mouse bar hovering
      .selectAll("rect")
      .on("mouseover", function () {
        var i = this.getAttribute("index");

        var iGDP = Ydataset[i].toFixed(0).replace(/(\d+)(?=(\d{3}))/g, "$1,");
        var iYear = dataset[i].toString().substr(0, 4);
        var iMonth = Xdataset[i].toString().substr(4, 4);
        var iQuart =
          iMonth == "Jan "
            ? "Q1"
            : iMonth == "Apr "
            ? "Q2"
            : iMonth == "Jul "
            ? "Q3"
            : "Q4";

        d3.select("#tooltip") // adding text to appear in the tooltip.++ add data as props.  ++  positioning tooltip
          .html(iYear + " " + iQuart + "<br>"+ "<strong> $" + iGDP + " Billion(s)</strong>")
          .attr("data-date", dataset[i][0])
          .style("left", YEARSscaled[i] + 30 + "px")
          .style("top", h - h * 0.5 + "px");
        d3.select("#tooltip").transition().duration(200).style("opacity", 0.9);
      });

    svg // tooltip desappearance on mouse bar leaving hovering
      .selectAll("rect")
      .on("mouseout", function () {
        d3.select("#tooltip").transition().duration(200).style("opacity", 0);
      });

    // ------------  AXIS  ------------
    const scaleGDP_inverted = d3 // scaleGDP is inverted, otherwise y lable would go from top to bottom
      .scaleLinear()
      .domain([0, Ydataset_max])
      .range([h - paddingYBottom, paddingYTop]);
    svg // X axis (id, class and positioning)
      .append("g")
      .call(d3.axisBottom(scaleYEARS))
      .attr("id", "x-axis")
      .attr("class", "tick")
      .attr("transform", "translate(0," + (h - paddingYBottom) + ")");
    svg // Y axis (id, class and positioning)
      .append("g")
      .call(d3.axisLeft(scaleGDP_inverted))
      .attr("id", "y-axis")
      .attr("class", "tick")
      .attr("transform", "translate(" + paddingXLeft + ",0)");

    // ------------  LABELS  ------------
    svg // X label (text, id and class)
      .append("text")
      .text("Date [years]")
      .attr("id", "xlabel")
      .attr("class", "label tick");
    svg // X label (positioning)
      .select("#xlabel")
      .attr("text-anchor", "middle")
      .attr("x", w * 0.5)
      .attr("y", h - paddingYBottom * 0.25);
    svg // Y label (text, id and class)
      .append("text")
      .text("Gross Domestic Product of USA [billion(s) $US]")
      .attr("id", "ylabel")
      .attr("class", "label tick");
    svg // Y label (positioning)
      .select("#ylabel")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -h * 0.5)
      .attr("y", 40);
  };
});
