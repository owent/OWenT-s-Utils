# cmake 递归包含头文件目录模块 
# include_directory_recurse [dir1 [dir2 [...]]] 
macro(include_directory_recurse)
	foreach(basedir ${ARGV})
	    file(GLOB_RECURSE SRC_HEADER_LIST_H "${basedir}/*.h" "${basedir}/*.hpp")
		set(LAST_HEAD_FILE_DIR "  ")
		foreach(src ${SRC_HEADER_LIST_H})
			# 去掉文件名，截取路径 
			string(REGEX REPLACE "(.+)[/\\].+\\.h(pp)?$" "\\1" CUR_HEAD_FILE_DIR ${src})
			
			if ( NOT "${CUR_HEAD_FILE_DIR}" STREQUAL "${LAST_HEAD_FILE_DIR}" )
				include_directories(${CUR_HEAD_FILE_DIR})
				set(LAST_HEAD_FILE_DIR "${CUR_HEAD_FILE_DIR}")
				
				message(STATUS "Recurse Include -- ${LAST_HEAD_FILE_DIR}")
			endif()
			
		endforeach()
	endforeach()
endmacro(include_directory_recurse)

# cmake 递归包含macro声明模块 
# include_macro_recurse [FILTER filter] | [dir1 [dir2 [...]]]
macro(include_macro_recurse)
	set(INCLUDE_MACRO_RECURSE_FILTER "*.macro.cmake")
	set(INCLUDE_MACRO_RECURSE_FILTER_FLAG "false")

	foreach(basedir ${ARGV})
        if ( "${basedir}" STREQUAL "FILTER" )
			set(INCLUDE_MACRO_RECURSE_FILTER_FLAG "true")
		elseif( "${INCLUDE_MACRO_RECURSE_FILTER_FLAG}" STREQUAL "true" )
			set(INCLUDE_MACRO_RECURSE_FILTER_FLAG "false")
			set(INCLUDE_MACRO_RECURSE_FILTER "${basedir}")
		else()
			file(GLOB_RECURSE ALL_MACRO_FILES "${basedir}/${INCLUDE_MACRO_RECURSE_FILTER}")
			foreach(macro_file ${ALL_MACRO_FILES})
				message(STATUS "Macro File Found: ${macro_file}")
				include("${macro_file}")
			endforeach()
		endif()
	endforeach()
endmacro(include_macro_recurse)

# cmake 递归包含工程列表模块 
# include_project_recurse [FILTER filter] | [dir1 [dir2 [...]]] 
macro(include_project_recurse)
	set(INCLUDE_PROJECT_RECURSE_FILTER "*.project.cmake")
	set(INCLUDE_PROJECT_RECURSE_FILTER_FLAG "false")
	
	foreach(basedir ${ARGV})
        if ( "${basedir}" STREQUAL "FILTER" )
			set(INCLUDE_PROJECT_RECURSE_FILTER_FLAG "true")
		elseif( "${INCLUDE_PROJECT_RECURSE_FILTER_FLAG}" STREQUAL "true" )
			set(INCLUDE_PROJECT_RECURSE_FILTER_FLAG "false")
			set(INCLUDE_PROJECT_RECURSE_FILTER "${basedir}")
		else()
			file(GLOB_RECURSE ALL_PROJECT_FILES "${basedir}/${INCLUDE_PROJECT_RECURSE_FILTER}")
			foreach(project_file ${ALL_PROJECT_FILES})
				message(STATUS "Project File Found: ${project_file}")
				include("${project_file}")
			endforeach()
		endif()
	endforeach()
endmacro(include_project_recurse)

