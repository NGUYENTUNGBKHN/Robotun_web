POSTS_DATA.push({
  id: "Learn-VHDL-FPGA-dev-part4",
  title: "Learn the fundamentals of VHDL and FPGA Develepment Part-4",
  excerpt: "Learn the fundamentals of VHDL and FPGA development, Part 4 - Constant and Signals",
  date: "2026-04-09",
  author: "Gentantun",
  tags: ["fpga", "Cyclone-V", "vhdl"],
  content: `## Constant and Signals

This video lecture explains the fundamental roles of signals and constants as objects in VHDL design. While they are not data types themselves, they can hold various data types like integers, standard logic, or standard logic vectors to help define a design's structure and behavior


### Constants


The primary purpose of a constant is to enhance code documentation and readability.


- Usage : Instead of hard-coding values (like a UART baudrate) multiple times, you define a constant once and reference its name throughout the design 1, 2. This makes the code much easier to understand and maintain.


- Syntax : Defined using the keyword *constant*, followeed by the name, data type, and assigned value *(e.g., constant name : type := value;)*


- Logic Example : In a two-bit comparator, a constant can be used to represent a fixed internal value that is compared against a changing input.


### Signals


Signals are used to pass dynamic data between different parts of a design.


- Usage : You can think of signals as interval wires on a breadboard that connect the output of one logic gate to the input of another. Because their values change based on inputs, they are essential for representing active logic operations.


- Syntax : Defined with the keyword signal, follower by a nema and type. An initial value is optional; if omitted, the compiler resolves it or uses a specified reset value.




Application in the Blinky LED project`
});