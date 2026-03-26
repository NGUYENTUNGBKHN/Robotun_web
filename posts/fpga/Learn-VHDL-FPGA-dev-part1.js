POSTS_DATA.push({
  id: "Learn-VHDL-FPGA-dev-part1",
  title: "Learn the fundamentals of VHDL and FPGA Develepment Part-1",
  excerpt: "Learn the fundamentals of VHDL and FPGA development.",
  date: "2026-03-24",
  author: "Gentantun",
  tags: ["fpga", "vhdl"],
  content: `## Introduction


### 1. What is the VHDL?




- VHDL is a Hardware Descriptive Language, same as Verilog.




- We use VHDL to describe a hardware ciruit.




- When you are writing VHDL, you are not programming, you can think of it more as architecting a digital circuit.




- The advantage of using VHDL is that if you architect your design correctly, you can take the VHDL design and port it to another FPGA/CPLD.




### 2. Where is VHDL used:




- To configure or 'Program' FPGA's and CPLDs, i.e. configurable hardware.




- Simulate digital circuits




- To create Application Specific Integrated Circuits(ASICs)




### 3. How will we be using VHDL?




- To configure the FPGA's on our development boards to control and interface with the various peripherals.


## Create project 


### 1. Vivado


Step 1: click Create Project.


Step 2: New pop-up windows is be showed. It is Project Name


- In Project name, enter your project.


- In Project Location, select location which stored your project.


- click Next.


Step 3: Project Type - Select RTL Project


- RTL Project: you will be able to add source. create block designs in IP integrator, generate IP, run RTL analysis, synthesis, implementation, design planning and analysis.


- Do not specify source at this time :


- Project is an extensible Vitis platform :


- click Next


Step 4: Add Source


- click Next.


Step 5: Add Constraints (optional)


- click Next.


Step 6: Default Part


- You can select Part or Board, but in this tutorial. Select Parts


- With Zybo-z7-10 : Zynq part is XC7Z010-1CLG400C, Select xc7z010clg400-1


- click Next.


Step 7: New Project Summary


- click Finish`
});