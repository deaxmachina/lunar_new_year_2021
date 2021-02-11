import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import suncalc from "suncalc";


const LunarCalendar = () => {

  /// refs ///
  const svgRef = useRef();
  const gRef = useRef();
  const yAxisRef = useRef();
  const headerRef = useRef();

  /// constants ///
  const width = 1400;
  const height = 850;
  const margin = ({top: 200, right: 0, bottom: 0, left: 60})
  const moonRadius = 14; 
  // months and days //
  const year = 2021;
  const now = new Date(year, 0, 1);
  const start = d3.timeYear(now);
  const months = d3.timeMonths(start, d3.timeYear.offset(start, 1));
  const days = d3.timeDays(start, d3.timeYear.offset(start, 1));
  // colours //
  const moonColour = "#073A4B"
  const newMoonColour = "#ffa62b" //"#f3dcb2"
  const backgroundColour = "#111"
  const whiteColour = "#f8edeb"


  /// D3 code ///
  useEffect(() => {


    ////////// Containers /////////////////
    const svg = d3.select(svgRef.current)
      .style("background", backgroundColour)
    const g = d3.select(gRef.current)

    ///////// Gradients ///////////////
    //Container for the gradients
    const defs = svg.append("defs")
    //Filter for the outside glow
    const glowFilter = defs.append("filter")
      .attr("id","glow")

    // change the std to make it more or less blurry 
    glowFilter.append("feGaussianBlur")
      .attr("class", "blur")
      .attr("stdDeviation", 0)
      .attr("result","coloredBlur");

    const feMerge = glowFilter.append("feMerge")
    feMerge.append("feMergeNode")
      .attr("in","coloredBlur")
    feMerge.append("feMergeNode")
      .attr("in","SourceGraphic")

    ///////////////////////
    ////// Scales ////////
    //////////////////////

    // Month Scale 
    const scaleForMonth = d3.scalePoint()
      .domain(d3.range(12))
      .range([margin.top, height - margin.bottom])
      .padding(1);
    const monthScale = d => scaleForMonth(d.getMonth())

    // Day Scale 
    const scaleForDay = d3.scalePoint()
      .domain(d3.range(1, 40))
      .range([margin.left, width - margin.right])
      .padding(1);
    const dayScale = d => {
      const start = d3.timeMonth(d);
      const offset = start.getDay() || 7;
      return scaleForDay(d.getDate() + offset)
      }

    ////////////////////////////////////////////////////////
    ////////////////////// Graph //////////////////////////
    ////////////////////////////////////////////////////////
    const projection = d3.geoOrthographic()
      .translate([0, 0])
      .scale(moonRadius)
    const hemisphere = d3.geoCircle()()
    const path = d3.geoPath(projection)

    //////// Moons ////////
    // group for each moon 
    const moonsG = g
      .selectAll("g")
      .data(days)
      .join("g")
        .attr("transform", d => `translate(${dayScale(d)}, ${monthScale(d)})`)
    // appen one full moon circle for each moon 
    const moonsCircle = moonsG 
      .append("circle")
        .attr("r", moonRadius)
        .attr("fill", moonColour)
        .attr("filter", "url(#glow)")
    // append path to moon circle to outline the current moon phase
    const moonsPath = moonsG  
      .append("path")
        .attr("fill", newMoonColour)
        .attr("d", d => {
          const noon = d3.timeHour.offset(d, 12);
          const illum = suncalc.getMoonIllumination(noon);
          const angle = 180 - illum.phase * 360;
          return `${projection.rotate([angle, 0]), path(hemisphere)}`
        })
    // append text with the day 
    const moonsText = moonsG
      .selectAll(".day-text").data(d=>[d]).join("text").classed('day-text', true)
        .attr("fill", whiteColour)
        .attr("y", -moonRadius)
        //.attr("x", -3)
        .attr("dy", "-0.35em")
        .style("text-anchor", 'middle')
        .attr("font-size", '10px')
        .style("font-family",'Quicksand, sans-serif')
        .text(d => `${d.getDate()}`)

    //////// Axis text ////////
    const gAxis = d3.select(yAxisRef.current)
    const axisLabelsG = gAxis
      .selectAll("g")
      .data(months)
      .join("g")
        .attr("transform", d =>`translate(${20}, ${monthScale(d)})`)

    const axisLabels = axisLabelsG
      .selectAll(".months-text").data(d=>[d]).join("text").classed("months-text", true)
        .attr("fill", whiteColour)
        .attr("dy", "0.32em")
        .style("text-transform", 'uppercase')
        .style("font-family",'Quicksand, sans-serif')
        .style("font-size", '12px')
        .text(d => `${d.toLocaleString("en", {month: "long"})}`)


    ////////////////////////////////////////////
    //////////////// Header ///////////////////
    //////////////////////////////////////////

    const totalWidthMoonsHeader = 150;

    const headerG = d3.select(headerRef.current)
      .attr("transform", `translate(${width/2 - totalWidthMoonsHeader + margin.left}, ${margin.top/3})`)

    // Refine the moon params for drawing the header moons (different size)
    const startDateHeader = new Date(2021, 2, 13)
    const endDateHeader = new Date(2021, 3, 14)
    const daysHeader = d3.timeDays(startDateHeader, endDateHeader);
    const projectionHeader = d3.geoOrthographic().translate([0, 0]).scale(10)
    const hemisphereHeader = d3.geoCircle()()
    const pathHeader = d3.geoPath(projectionHeader)

    // append path to moon circle to outline the current moon phase
    const getAngle = (day) => {
      const noon = d3.timeHour.offset(daysHeader[day], 12);
      const illum = suncalc.getMoonIllumination(noon);
      const angle = 180 - illum.phase * 360;
      return angle
    }

    ///////////////// line paths ////////////////
    const leftLine = headerG
      .selectAll(".left-line").data([0]).join("line").classed("left-line", true)
      .attr("stroke", whiteColour)
      .attr("y1", 0).attr("y2", 0)
      .attr("x1", -110).attr("x2", -10)
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
    const rightLine = headerG
    .selectAll(".right-line").data([0]).join("line").classed("right-line", true)
      .attr("stroke", whiteColour)
      .attr("y1", 0).attr("y2", 0)
      .attr("x1", 210).attr("x2", 310)
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")

    ////////////////// moon paths ////////////////
    const moon1 = headerG  
      .selectAll(".moon-title-1").data([0]).join("path").classed("moon-title-1", true)
        .attr("fill", whiteColour)
        .attr("transform", `translate(${0}, ${0})`)
        .attr("d", d => {
          const angle = getAngle(1)
          return `${projectionHeader.rotate([angle, 0]), pathHeader(hemisphereHeader)}`
        })
    const moon2 = headerG  
      .selectAll(".moon-title-2").data([0]).join("path").classed("moon-title-2", true)
        .attr("fill", whiteColour)
        .attr("transform", `translate(${25}, ${0})scale(1.25)`)
        .attr("d", d => {
          const angle = getAngle(5)
          return `${projectionHeader.rotate([angle, 0]), pathHeader(hemisphereHeader)}`
        })
    const moon3 = headerG  
      .selectAll(".moon-title-3").data([0]).join("path").classed("moon-title-3", true)
        .attr("fill", whiteColour)
        .attr("transform", `translate(${50}, ${0})scale(1.5)`)
        .attr("d", d => {
          const angle = getAngle(8)
          return `${projectionHeader.rotate([angle, 0]), pathHeader(hemisphereHeader)}`
        })
    const moon4 = headerG  
      .selectAll(".moon-title-4").data([0]).join("path").classed("moon-title-4", true)
        .attr("fill", whiteColour)
        .attr("transform", `translate(${100}, ${0})scale(2.2)`)
        .attr("d", d => {
          const angle = getAngle(15)
          return `${projectionHeader.rotate([angle, 0]), pathHeader(hemisphereHeader)}`
        })
    const moon5 = headerG  
      .selectAll(".moon-title-5").data([0]).join("path").classed("moon-title-5", true)
        .attr("fill", whiteColour)
        .attr("transform", `translate(${150}, ${0})scale(1.5)`)
        .attr("d", d => {
          const angle = getAngle(23)
          return `${projectionHeader.rotate([angle, 0]), pathHeader(hemisphereHeader)}`
        })
    const moon6 = headerG  
      .selectAll(".moon-title-6").data([0]).join("path").classed("moon-title-6", true)
        .attr("fill", whiteColour)
        .attr("transform", `translate(${175}, ${0})scale(1.25)`)
        .attr("d", d => {
          const angle = getAngle(25)
          return `${projectionHeader.rotate([angle, 0]), pathHeader(hemisphereHeader)}`
        })
    const moon7 = headerG  
      .selectAll(".moon-title-7").data([0]).join("path").classed("moon-title-7", true)
        .attr("fill", whiteColour)
        .attr("transform", `translate(${200}, ${0})scale(1)`)
        .attr("d", d => {
          const angle = getAngle(29)
          return `${projectionHeader.rotate([angle, 0]), pathHeader(hemisphereHeader)}`
        })


  }, [])

  return (
    <>
      <div className="wrapper-lunarCalendar">
        <h2 className="title-lunarCalendar">Lunar Calendar 2021</h2>
        <svg ref={svgRef} width={width} height={height}>
          <g ref={gRef}></g>
          <g ref={yAxisRef}></g>
          <g ref={headerRef}></g>
        </svg>
      </div>
    </>
  )
};

export default LunarCalendar;