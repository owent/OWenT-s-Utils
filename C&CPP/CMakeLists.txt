cmake_minimum_required(VERSION 2.8.9)

project(OWenTsUtilsCPP)

# 编译选项 
#####################################################################
option(BUILD_SHARED_LIBS "Build shared libraries (DLLs)." OFF)
if(NOT CMAKE_CONFIGURATION_TYPES AND NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE "Release")
endif()

include(${PROJECT_SOURCE_DIR}/project/cmake/CompilerOption.cmake)
include(${PROJECT_SOURCE_DIR}/project/cmake/TargetOption.cmake)

# 设置输出目录 
set(PROJECT_ALL_INCLUDE_DIR "${PROJECT_SOURCE_DIR}/include")
set(PROJECT_ALL_SOURCE_DIR "${PROJECT_SOURCE_DIR}/src")
include_directories ("${PROJECT_ALL_INCLUDE_DIR}")

file(GLOB_RECURSE SRC_LIST "${PROJECT_ALL_SOURCE_DIR}/*.c" "${PROJECT_ALL_SOURCE_DIR}/*.cpp")
file(GLOB_RECURSE HEADER_LIST "${PROJECT_ALL_INCLUDE_DIR}/*.h" "${PROJECT_ALL_INCLUDE_DIR}/*.hpp")

set(EXECUTABLE_OUTPUT_PATH ${PROJECT_BINARY_DIR}/bin)
set(LIBRARY_OUTPUT_PATH ${PROJECT_BINARY_DIR}/lib)
link_directories (${LIBRARY_OUTPUT_PATH})

add_library(owent_utils ${SRC_LIST})

install(TARGETS owent_utils
            RUNTIME DESTINATION bin
            LIBRARY DESTINATION lib
            ARCHIVE DESTINATION lib
	)
	
install(DIRECTORY "${PROJECT_ALL_INCLUDE_DIR}" DESTINATION .
	FILES_MATCHING REGEX ".+\\.h(pp)?$"
	)

add_subdirectory("${PROJECT_SOURCE_DIR}/sample")
add_subdirectory("${PROJECT_SOURCE_DIR}/test")
			
