#!/usr/bin/python

import io,sys,os,stat;

for i in range(1, len(sys.argv)):
    # os.fchmod(sys.argv[i], stat.S_IRWXU)
    f = open(sys.argv[i], "r+b")
    if f and f.read(3) == "\xEF\xBB\xBF":
        rc = f.read()
        f.seek(0, os.SEEK_SET)
        print("remove BOM of file: " + sys.argv[i])
        f.write(rc)
        f.truncate()
        pass
    f.close()

