import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import _ from "lodash";
import chroma from "chroma-js";

const data = [
  {name: 0}, {name: 1},{name: 2},{name: 3},{name: 4},{name: 5},{name: 6},{name: 7},{name: 8},{name: 9},{name: 10}, {name: 11}, {name: 12}, {name: 13}, {name: 14}, {name: 15}, {name: 16}, {name: 17}, {name: 18},{name: 19}, {name: 20}, {name: 21}, {name: 22}, {name: 23}, {name: 24}, {name: 25}, {name: 26}, {name: 27}, {name: 28}, {name: 29}, {name: 30}, {name: 31}, {name: 32},
]


const Dumplings = () => {

  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();

  /// constants ///
  const width = 1000;
  const height = 900;
  const mochiRadius = 23; 
  const coloursMochi = ["#06d6a0", "#118ab2", "#ef476f"]
  const whiteMochi = "#fff"
  const mochiFace = "#333"

  /// D3 code ///
  useEffect(() => {
    const svg = d3.select(svgRef.current).style("background", "#111")
    const g = d3.select(gRef.current)
      .attr("transform", `translate(${width/2}, ${height/2})`)

    /// Scales ///
    const colorScale = chroma.scale(coloursMochi
      .map(color => chroma(color).saturate(1)))
      .colors(data.length)

    ///////////////////////
    /////// Graph ////////
    //////////////////////

    ///// Nodes /////////
    const nodes = g
      .selectAll(".node")
      .data(data, d => d) 
      .join("g")
      .classed("node", true)
    nodes.append("circle")
      .attr("r", mochiRadius)
      .attr("fill", (d, i) => i%3 == 0 ? whiteMochi : colorScale[i])
    nodes.append("line")
      .attr("stroke", mochiFace)
      .attr("y1", -2)
      .attr("y2", 0)
      .attr("x1", 7)
      .attr("x2", 7)
      .attr("stroke-linecap", "round")
    nodes.append("line")
      .attr("stroke", mochiFace)
      .attr("y1", -2)
      .attr("y2", 0)
      .attr("x1", -7)
      .attr("x2", -7)
      .attr("stroke-linecap", "round")
    nodes.append("path")
      .attr("d", "M-2,-1 C-2,1 2,1 2,-1")
      .attr("transform", `translate(${0}, ${1})`)
      .attr("fill", 'none')
      .attr("stroke", mochiFace)
      .attr("stroke-linecap", "round")

    /////// Force //////////
    function tick() {
      nodes
        .attr("transform", d => `translate(${d.x}, ${d.y})`)
    }
    /// define the force ///
    const simulation = d3.forceSimulation(data)
        .force("charge", d3.forceCollide().radius(mochiRadius))
        .force("r", d3.forceRadial(function(d) { return 200 }))
        .on("tick", tick)
        //.stop();

    tick();

  }, [])

  return (
    <>
      <div className="wrapper-dumplings">
        <svg ref={svgRef} width={width} height={height}>
          <g ref={gRef}></g>
        </svg>
      </div>
    </>
  )
};

export default Dumplings;