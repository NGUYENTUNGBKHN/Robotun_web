POSTS_DATA.push({
  id: "build-uboot-cyclone-v",
  title: "Building U-Boot for Cyclone V and Arria 10",
  excerpt: "Step-by-step guide to build and deploy U-Boot bootloader on Altera Cyclone V FPGA board",
  date: "2026-03-21",
  author: "RocketBoards",
  tags: ["u-boot", "cyclone", "altera", "embedded-linux", "bootloader", "fpga"],
  content: `## Introduction


This page cotains intructions on how to build U-boot in the following configurations:




| Device | Quartus Version | U-boot Branch | Linux Branch |
| --- | --- | --- | --- |
| Cyclone V Soc | 22.1 Std | 2022.04 | 5.15.50-lts |
| Arria 10 Soc | 24.3 Pro | socfpga_v2024.04 | socfpga-6.6.37-lts |




Note: SoC EDS is no longer required to generate the handoff folder for Cyclone V for release 22.1 std and after. Please refer to section below if you are using version 21.1std and older.




Starting with SoC EDS Pro version 19.3 and SoC EDS Standard version 19.1, the following changes were make:
- The bootloader source code was removed from SoC EDS. Instead, the user needs to clone the git trees from [https://github.com/altera-opensource/u-boot-socfpga](https://https://github.com/altera-opensource/u-boot-socfpga). 


- The same U-Boot branch is used for all SoC FPGA devices: Cyclone V SoC, Arria V SoC, Arria 10 SoC, Stratix 10 SoC, Agilex.
- The bootloader generator (bsp-editor) still needs to be used for Cyclone V Soc, Arria V SoC and Arria 10 SoC, but:










Note that Arria V SoC flow is identical with the Cyclone V SoC one, so it is not presented separately.
Starting with Quartus Pro 20.3, the SoC EDS was discontinued, and the functionality of the tools which were previously part of SoC EDS are provided separately. For Arria 10, the bsp-editor functionality was incorporated in an U-Boot script, and the tool is not needed anymore.


## U-Boot Branches


The official Intel SOCFPGA U-Boot repository is located at [https://github.com/altera-opensource/u-boot-socfpga.](https://https://github.com/altera-opensource/u-boot-socfpga)
Note:
- A "RC" labeled branch is for internal active development use and customer early access without official customer support.

- Latest stable branch (no RC labeled) is strongly recommended for development and production use outside of Intel.



## U-Boot Build Flows


### Cyclone V SoC and Arria 10 SoC


For Cyclone V SoC and Arria V SoC, the handoff information created by Quartus compilation comes in several formats: C source code, XML and binary files. Bsp-editor takes this information and turns it into source code which is used to build U-Boot. For older versions of SoC EDS, the user could set various U-Boot parameters in bsp-editor. For the current version of SoC EDS, they have no effect.


Old flow
The boot could be built in previous versions of SoC EDS using the following flow :

Key aspects to note:
- Most user options (like boot source, enabling ECC scrubbing, watchdog etc) were set through the bsp-editor GUI or the command line equivalents.

- U-boot source code was part of SoC EDS.

- The makefile created by the bsp-editor allowed building the bootloader with a single 'make' command.



New Flow


Starting with this release of SoC EDS, the build flow is different, as depicted below:

Key differences are:
- list item`
});