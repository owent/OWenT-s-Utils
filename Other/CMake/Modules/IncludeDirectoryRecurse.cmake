
macro(IncludeDirectoryRecurse)
	foreach(basedir ${ARGV})
	    file(GLOB_RECURSE SRC_HEADER_LIST_H "${basedir}/*.h" "${basedir}/*.hpp")
		set(LAST_HEAD_FILE_DIR "  ")
		foreach(src ${SRC_HEADER_LIST_H})
			#去掉文件名，截取路径
			string(REGEX REPLACE "(.+)[/\\].+\\.h(pp)?$" "\\1" CUR_HEAD_FILE_DIR ${src})
			
			if ( NOT "${CUR_HEAD_FILE_DIR}" STREQUAL "${LAST_HEAD_FILE_DIR}" )
				include_directories(${CUR_HEAD_FILE_DIR})
				set(LAST_HEAD_FILE_DIR "${CUR_HEAD_FILE_DIR}")
				
				message("-- Recurse Include -- ${LAST_HEAD_FILE_DIR}")
			endif()
			
		endforeach()
	endforeach()
endmacro(IncludeDirectoryRecurse)

