POSTS_DATA.push({
  id: "stm32f746-qspi-flash-module",
  title: "STM32F746 QSPI flash (Quad Serial Protocol Interface)",
  excerpt: "STM32F746 QSPI flash (Quad Serial Protocol Interface)",
  date: "2026-03-27",
  author: "Gentantun",
  tags: ["stm32", "mcu", "stm32f746", "qspi"],
  content: `## Introduction


The QUADSPI is a specialized communication interface targeting single, dual- or quad-SPI flash memories. It can operate in any of the three following modes:


- Indirect mode : all the operations are performed using the QUADSPI registers.


- Automatic status-polling mode : The external flash memeory status register is periodically read and an interrupt can be generated in case of flag setting.


- Memory-mapped mode : The external flash memory is mapped to the device addres space and is seen by the system as if it was an internal memory


Main feature :


- Three functional modes : indirect mode, automatic status polling, and memory mapped


- Dual-flash mode, where 8 bits can be sent/received simultaneously by accessing two flash memories in parallel


- SDR and DDR support


- Fully programmable opcode for both indirect and memory-mapped modes


- Fully programmable frame format for both indirect and memory-mapped modes


- Integrated FIFO for reception and transmission


- 8, 16, 32-bit data accesses transmission 

- DMA channel for indirect mode opearations

- Interrupt generation on FIFO thredhold, timeout, opearation complete, and access error



## QUADSPI functional description


### Block diagram


Singer flash


Dual flash


### QUADSPI pin


| Signal name | Signal type | Description |
| --- | --- | --- |
| CLK | output | Clock to Flash 1 and Flash 2 |
| BK1_IO0/SO | input/output | Bidirectional I/O in dual/quad modes or serial output in single mode, for FLASH 1 |
| BK1_IO1/SI | input/output | Bidirectional I/O in dual/quad modes or serial input in single mode, for FLASH 1 |
| BK1_IO2 | input/output | Bidirectional I/O in quad mode, for FLASH 1 |
| BK1_IO3 | input/output | Bidirectional I/O in quad mode, for FLASH 1 |
| BK2_IO0/S0 | input/output | Bidirectional I/O in dual/quad modes or serial output in single mode, for FLASH 2 |
| BK2_IO1/SI | input/output | Bidirectional I/O in dual/quad modes or serial input in single mode, for FLASH 2 |
| BK1_IO2 | input/output | Bidirectional I/O in quad mode, for FLASH 2 |
| BK1_IO3 | input/output | Bidirectional I/O in quad mode, for FLASH 2 |
| BK1_NCS | output | Chip select (active low) for FLASH 1. Can also be used for FLASH 2 if QUADSPIis always used in dual-flash mode. |
| BK2_NCS | output | Chip select (active low) for FLASH 2. Can also be used for FLASH 1 if QUADSPIis always used in dual-flash mode. |


### QUADSPI command sequence 


Each command includes five phases :


1) Instruction :


- Specifying the type of operation to be performed


- Configured in INSTRUCTION bitfield of QUADSPI_CCR[7:0] register.


- Configured using the IMODE[1:0] bitfield of QUADSPI_CCR[9:8] register


2) Address :


- Indicate the address of the operation


- The number of address bytes to be sent is configured in the ADSIZE[1:0] bitfield of QUADSPI_CCR[13:12] register


- In indirect and automatic status-polling modes, address bytes to be sent are specified in the ADDRESS[31:0] bitfield of QUADSPI_AR register.


- In memory-mapped mode, the address is given directly via the AHB (from the Cortex or from a DMA)


- Configured using the ADMODE[1:0] bitfield of QUADSPI_CCR[11:10] register.


3) Alternate byte :


- Control the mode of operation


- The number of alternate bytes to be sent is configured in the [1:0] bitfield of QUADSPI_CCR[17:16] register. The bytes to be sent are specified in the QUADSPI_ABR register.


- configured using the ABMODE[1:0] bitfield of QUADSPI_CCR[15:14] register.


4) Dummy :


- Give time to the flash memory to prepare for the data phase when higher clock frequencies are used


- The number of cycles given during this phase is specified in the DCYC[4:0] bitfield of QUADSPI_CCR[22:18] register


- The operating mode of the dummy-cycles phase is determined by DMODE


5) Data : 


- In indirect and automatic status-polling modes, the number of bytes to be sent/received is specified in the QUADSPI_DLR register.


- In indirect-write mode the data to be sent to the flash memory must be written to the QUADSPI_DR register. In indirect-read mode the data received from the flash memory is obtained by reading the QUADSPI_DR register


- In memory-mapped mode, the data which is read is sent back directly over the AHB to the Cortex or to a DMA.


- configured using the ABMODE[1:0] bitfield of QUADSPI_CCR[15:14] register


### QUADSPI signal interface protocol modes


1) Single-SPI mode


- It is a legecy SPI mode


2) Dual-SPI mode


- 


3) Quad-SPI mode


4) SDR mode


5) DDR mode


6) Dual-flash mode`
});