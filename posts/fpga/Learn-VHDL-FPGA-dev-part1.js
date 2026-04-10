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


- click Finish


### 2. Quartus


Step 1: click New Project Wizard. New Project Wizard Windows is be showing.


Step 2: Introduction


- Click Next.


Step 3: Directory, Name, Top-Level Entity


- Enter your project direction and name.


- Click Next


Step 4: Project Type


- Select Empty project


- Click Next


Step 5: Add Files


- We will create file later. So, Click Next.


Step 6: Fammily, Device & Board Settings


- You can see Device and Board.


- Search device 5CSEBA6U23I7, and select it.


- click Next.


Step 7: EDA Tool Settings


- In this windows, do nothing keep default settings.


- Click Next.


Step8: Summary


- Click Finish.


## VHDL Design Structure


### 1. VHDL Keywords


- Comment "--" : Used to document and describe your design




\`\`\`c
-- This is a comment-- This is another comment
\`\`\`


- Library "library" : Used to designate the library used in your design
-- This is a comment
- Use "use" : make a package from the library available to this design unit.
- Entity "entity" : Defines the inputs and outputs of your design 
- Architecture "architechture" : This is where the actual design goes
- Generic "generic" : Defines general parts of the design
- Port "port" : Defines the interface, I/O's of the design
- Downto "downto" : Define the middle of a range
- Begin "degin"; Start of a begin -end pair
- End "end" : End of a begin - end pair
- Map "map" Used to map parameters, i.e port map in component instantiations
- Signal Assignment "<=" : Used to assign one signal to another inside a design

### 2. Library


[std_logic_1164.vdl](https://github.com/NGUYENTUNGBKHN/ghdl/blob/master/libraries/ieee/std_logic_1164.vhdl)



1) There are key feature:
- STD_ULOGIC
\`\`\`c
type STD_ULOGIC is ( 'U',        -- Uninitialized
                     'X',             -- Forcing  Unknown
                     '0',             -- Forcing  0
                     '1',             -- Forcing  1
                     'Z',             -- High Impedance
                     'W',             -- Weak     Unknown
                     'L',             -- Weak     0
                     'H',             -- Weak     1
                     '-'              -- Don't care
                   );  
\`\`\`


- The STDULOGIC type is the foundation of the IEEE 1164 standard used in VHDL. Unlike simple bit (which is only 0 or 1), this 9-value logic system allows you to simulate how digital hardware behaves in the real world, including electrical strengths and uninitialized states.
- The "Forcing" Values (Strong Signals)
+ '0' (Forcing 0): + '1' (Forcing 1):+ 'X' (Forcing Unknown)
- The "Weak" Values (Resistive Signals)
+ 'L' (Weak 0): A weak low (pull-down)+ 'H' (Weak 1): A weak high (pull-up)+ 'W' (Weak Unknown): A weak signal where the value cannot be determined
- The Physical/Simulation States
+ 'Z' (High Impedance):+ 'U' (Uninitialized):+ '-' (Don't care):


### 3. VHDL entities & Architecture




Entity




The top of every design hierachy must be an enitty.
Entities may range from primitive circuits to complex assemblies.




The entity code typically defines just the interface of the entity






\`\`\`c
entity identifier is     generic ( genric_variable_declarations); -- optional
     port    ( input_and_output_variable_declarations);
     [ declarations, see allowed list below] -- optional
begin
     [ statements, see allowed list below]   -- optional
end entity identifier; 
\`\`\`


generic_variable_declarations are of the form:
  variable_name : variable_type := variable_value; -- := variable_value optional


input_and_out_variable_declaration are of the form:
  variable_name : port_mode variable_type;
port_mode may be in out inout buffer linkage




\`\`\`c
entity adder is    generic (N  : natual := 32);
   port (A     : in bit_vector(N-1 downto 0);
         B     : in bit_vector(N-1 downto 0);
         cin   : in bit;
         Sum   : out bit_vector(N-1 downto 0);
         Count : out bit;
         );
end entity adder;


entity test_bench is   -- typical top level, simulatable, entity
end entity test_bench;


entity Latch is
     port (Din  : in Word;
          Dout : out Word;
          Load : in Bit;
          Clk  : in Bit;
          );
    Constant Setup: Time := 12 ns;
    Constant PulseWidth: Time := 50 ns;
    use WORK.TimingMonitor.all
begin
    assert Clk='1' or Clk'Delayed'Stable(PulseWidth);
    CheckTiming(Setup, Din, Load, Clk);  -- passive concurrent procedure
end entity Latch; 
\`\`\`
### 4. Data type
Standard Logic
Standard Logic Vector
Unsigned 
Signed
Integer


### 5. Concurrent and Sequential Statement
Concurrent Statements
- Signal Assignment : These can be inside a process, case statement, etc.
- Process Statement : You can rearrange process statements.
Sequential Statements
- If Statement: infer priority
- Case Statement: Equal Priority
These must go inside a process`
});