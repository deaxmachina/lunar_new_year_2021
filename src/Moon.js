import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import suncalc from "suncalc";
import _ from "lodash";
import chroma from "chroma-js";
import { annotationCalloutElbow, annotationCalloutCurve, annotation } from "d3-svg-annotation";

// This is the data for the mochi 
const dataMochi = [
  {name: 0}, {name: 1},{name: 2},{name: 3},{name: 4},{name: 5},{name: 6},{name: 7},{name: 8},{name: 9},{name: 10}, {name: 11}, {name: 12}, {name: 13}, {name: 14}, {name: 15}, {name: 16}, {name: 17}, {name: 18},{name: 19}, {name: 20}, {name: 21}, {name: 22}, {name: 23}, {name: 24}, {name: 25}, {name: 26}, {name: 27}, {name: 28}, {name: 29}, {name: 30}, {name: 31}, {name: 32}, {name: 33}, {name: 34}, {name: 35}, {name: 36}, {name: 37}, {name: 38}, {name: 39}, {name: 40}, {name: 41}, {name: 42}, {name: 43}, {name: 44}, {name: 45}, {name: 46},
  {name: 47}, {name: 48}, {name: 49}, {name: 50}, {name: 51}, {name: 52}, {name: 53}, {name: 54},{name: 55}, {name: 56}, {name: 57}, {name: 58}, {name: 59}, {name: 60}, {name: 61}, {name: 62}, {name: 63}, {name: 64}, {name: 65}, {name: 66}, {name: 67}, {name: 67}, {name: 68}, {name: 69}, {name: 70}, {name: 71}, {name: 72}, {name: 73}, {name: 74}, {name: 75}, {name: 76}, {name: 77}, {name: 78}, {name: 79}, {name: 80}, {name: 81}, {name: 82}, {name: 83}, {name: 84}, {name: 85}, {name: 86}, {name: 87}
]

const keys = Array(88).fill("name")
const values = _.range(88)
var result =  Object.assign.apply({}, keys.map( (v, i) => ( {[v]: values[i]} ) ) );



const Moon = () => {

  /// refs ///
  const svgRef = useRef();
  const gMoonRef = useRef();
  const gMochiRef = useRef();
  const annotationRef = useRef();

  /// constants ///
  const width = 1000;
  const height = 800;
  const moonRadius = 150; 
  const skyInnerRadius = 140;
  const skyOuterRadius = 350;
  const mochiRadius = 20; 
  // months and days //
  const year = 2021;
  const startDate = new Date(year, 2, 12)
  const endDate = new Date(year, 2, 28)
  const days = d3.timeDays(startDate, endDate);
  // colours - moon //
  const moonColour = "#111"
  const newMoonColour = "#fff"
  const backgroundColour = "#111"
  // colours - mochi //
  const coloursMochi = ["#06d6a0", "#118ab2", "#ef476f"]
  const whiteMochi = "#fff"
  const mochiFace = "#333"
  const yellowMoonColour = '#ffa62b'


  /// D3 code ///
  useEffect(() => {

    const svg = d3.select(svgRef.current)
    //.style("background", backgroundColour)
    // group for the moon and sky 
    const gMoon = d3.select(gMoonRef.current)
      .attr("transform", `translate(${width/2}, ${height/2})`)
    // group for the mochi 
    const gMochi = d3.select(gMochiRef.current)
      .attr("transform", `translate(${width/2}, ${height/2})`)

    /////////////////////////////////////////////////////
    ////////////////// Gradients ///////////////////////
    ///////////////////////////////////////////////////

    //Container for the gradients
    const defs = svg.append("defs")

    /// Glow ///
    //Filter for the outside glow
    const glowFilter = defs.append("filter")
      .attr("id","glow")

    // change the std to make it more or less blurry 
    glowFilter.append("feGaussianBlur")
      .attr("class", "blur")
      .attr("stdDeviation", 6)
      .attr("result","coloredBlur");

    const feMerge = glowFilter.append("feMerge")
    feMerge.append("feMergeNode")
      .attr("in","coloredBlur")
    feMerge.append("feMergeNode")
      .attr("in","SourceGraphic")

    /// Radial Gradients ///
		defs.append("radialGradient")
      .attr("id", "radial-gradient")
      .attr("cx", "50%")	//not really needed, since 50% is the default
      .attr("cy", "50%")	//not really needed, since 50% is the default
      .attr("r", "50%")	//not really needed, since 50% is the default
      .selectAll("stop")
        .data([
          {offset: "0%", color: "#006466" },
          {offset: "60%", color: "#065a60"},
          {offset: "100%", color:  "#212f45"},
          ])
      .enter().append("stop")
      .attr("offset", function(d) { return d.offset; })
      .attr("stop-color", function(d) { return d.color; });

    /// Static Noise ///
    const staticNoise = defs 
      .append("filter")
      .attr("id", "noise")

    staticNoise.append("feTurbulence")
      .attr("type", "fractalNoise")
      .attr("baseFrequency", 0.9)
      .attr("result", "noisy")

    staticNoise.append("feColorMatrix")
      .attr("type", "saturate")
      .attr("values", 0)

    staticNoise.append("feComposite")
      .attr("operator", "in")
      .attr("in2", "SourceGraphic")
      .attr("result", "monoNoise")

    staticNoise.append("feBlend")
      .attr("in", "SourceGraphic")
      .attr("in2", "monoNoise")
      .attr("mode", "multiply")


    ////////////////////////////////////////////////
    ///////////// Graph - Moon ////////////////////
    //////////////////////////////////////////////

    //////////// Outer Circle - Sky /////////////
    const arc = d3.arc()
    const outerCircleNoise = gMoon
      .selectAll(".outer-circle-noise")
      .data([0])
      .join("path")
        .classed("outer-circle-noise", true)
        .attr("id", "sky")
        .style("fill", "url(#radial-gradient)")
        .attr("opacity", 1)
        .attr("filter", "url(#glow)")
        .attr("d", d => arc({
          innerRadius: skyInnerRadius,
          outerRadius: skyOuterRadius,
          startAngle: 0,
          endAngle: 2*Math.PI 
        }))

    ///////// Text along outer circle //////////
  const happyNewYear = gMoon
    .append("text")
    .attr("dy", "-1em")
    .append("textPath") //append a textPath to the text element
      .attr("xlink:href", "#sky") //place the ID of the path here
      .style("text-anchor","middle") //place the text halfway on the arc
      .attr("startOffset", "60%")
      .text("Happy Lunar New Year!")
      .style("fill", "#f8edeb")
      .style("font-size", '40px')
      .style("font-family", 'Clicker Script, cursive')
      

    //////////////// Moon /////////////////////
    const projection = d3.geoOrthographic()
      .translate([0, 0])
      .scale(moonRadius)
    const hemisphere = d3.geoCircle()()
    const path = d3.geoPath(projection)

    const moonsCircle = gMoon 
      .selectAll(".moon-circle")
      .data([0])
      .join("circle")
      .classed("moon-circle", true)
        .attr("r", moonRadius)
        .attr("fill", moonColour)
        .attr("filter", "url(#noise)")

    // append path to moon circle to outline the current moon phase
    const getAngle = (day) => {
      const noon = d3.timeHour.offset(days[day], 12);
      const illum = suncalc.getMoonIllumination(noon);
      const angle = 180 - illum.phase * 360;
      return angle
    }
    // moon path 
    const moonsPath = gMoon  
      .selectAll(".moon")
      .data([0])
      .join("path")
      .classed("moon", true)
        .attr("fill", newMoonColour)
        .attr("d", d => {
          const angle = getAngle(0)
          return `${projection.rotate([angle, 0]), path(hemisphere)}`
        })
        .attr("filter", "url(#noise)")


    ////////////////////////////////////////////////
    ///////////// Graph - Mochi ///////////////////
    //////////////////////////////////////////////

    ////////////// Annotations ////////////////////
    const type = annotationCalloutCurve
    const annotations = [{
      note: {
        label: "We are sorry that this is the only treat you get for this celebration but the cook can only really make sandwiches... However, we are cute and loving and bring you lots of coin 💖 🐾",
        title: "We are mochi :)"
      },
      dy: 100,
      dx: 100,
      x: 300,
      y: -100,
      color: "#f8edeb",
    }]
    const makeAnnotations = annotation()
      .editMode(false)
      .notePadding(10)
      .type(type)
      .annotations(annotations)

    const mochiAnnotation = d3.select(annotationRef.current)
      .attr("class", "annotation-group")
      .style("font-family", "sans-serif")
      .attr("fill", "hotpink")
      .style("font-size", '12px')
      .style("opacity", 0)
      .call(makeAnnotations)

    /////////////// Scales ////////////////////
    const colorScale = chroma.scale(coloursMochi
      .map(color => chroma(color).saturate(1)))
      .colors(dataMochi.length)

    /////////////// Nodes //////////////////////
    const nodes = gMochi
      .selectAll(".node")
      .data(dataMochi, d => d) 
      .join("g")
      .classed("node", true)
      .attr("opacity", 0)
    nodes.append("circle")
      .attr("r", mochiRadius)
      .attr("fill", (d, i) => i%3 == 0 ? whiteMochi : colorScale[i])
    nodes.append("line")
      .attr("stroke", mochiFace)
      .attr("y1", -2).attr("y2", 0)
      .attr("x1", 7).attr("x2", 7)
      .attr("stroke-linecap", "round")
    nodes.append("line")
      .attr("stroke", mochiFace)
      .attr("y1", -2).attr("y2", 0)
      .attr("x1", -7).attr("x2", -7)
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
    const simulation = d3.forceSimulation(dataMochi)
        .force("charge", d3.forceCollide().radius(mochiRadius))
        .force("r", d3.forceRadial(function(d) { return 300 }))
        .on("tick", tick)
        .stop();

    //tick();


    ///////////////////////////////////////////
    //////////////// Animation ////////////////
    ///////////////////////////////////////////   

    let timer 
    const timeToAnimate = 800
    let n = 0;
    
    // Function containing everything that happens on animation 
    // every timeToAnime sections, this function is run 
    // since it increments n, each timeToAnime seconds it will update the path 
    // with a different angle, i.e. correspoding to different day 
    const step = () => {
      //console.log("I am the step function") 
      n = n + 1;  
      // clear interval i.e. stop animation after certain number of steps
      if (n > days.length) {
        clearInterval(timer)
      } else if (n == days.length) {
        // at last stage of moon release the mochi
        //console.log("full noon")
        moonsPath.attr("d", d => {
          const angle = getAngle(n)
          return `${projection.rotate([angle, 0]), path(hemisphere)}`
        })
        setTimeout(() => {
          // trigger the force simulation for mochi
          simulation.restart();
          nodes.transition().attr("opacity", 1);
          // change the background of the svg and make it take up whole screen 
          svg
            .attr("height", window.innerHeight)
            .attr("width",  window.innerWidth)
            .style("background", backgroundColour)
          // move the groups for moon and mochi to center of whole screen
          gMoon.attr("transform", `translate(${window.innerWidth/2}, ${window.innerHeight/2})`)
          gMochi.attr("transform", `translate(${window.innerWidth/2}, ${window.innerHeight/2})`)
          // remove the sky arc 
          outerCircleNoise.attr("opacity", 0)
          // remove the background sky
          moonsCircle.attr("opacity", 0)
          // remove noise filter, add glow filter and change fill of full moon
          moonsPath.attr("filter", "url(#glow)").attr('fill', yellowMoonColour)
          // show the annotation on the mochi
          mochiAnnotation.style("opacity", 1)
          // add star to the new year message 
          happyNewYear.text("Happy Lunar New Year! ✨")

        }, 1500);

      } else {
        //console.log(n)
        moonsPath.attr("d", d => {
          const angle = getAngle(n)
          return `${projection.rotate([angle, 0]), path(hemisphere)}`
        })
      }

    };
    timer = setInterval(step, timeToAnimate);

    // alternatively to run the step function for the animation with a play button: 
    /*
    const button = d3.select(buttonRef.current)
    button.on("click", function(e, datum) {
      timer = setInterval(step, timeToAnimate);
    })
    */

  }, [])

  return (
    <>
      <div className="wrapper-moon">
        <svg ref={svgRef} width={width} height={height}>
          <g ref={gMoonRef}></g>
          <g ref={gMochiRef}>
            <g ref={annotationRef}></g>
          </g>
        </svg>
      </div>
    </>
  )
};

export default Moon;