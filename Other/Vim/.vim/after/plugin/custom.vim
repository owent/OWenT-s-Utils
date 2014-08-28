" 第一行设置tab键为4个空格，第二行设置当行之间交错时使用4个空格 
set tabstop=4
set shiftwidth=4

" 用空格键替换制表符 
set expandtab

" 设置匹配模式，类似当输入一个左括号时会匹配相应的那个右括号 
set showmatch

" 去除vim的GUI版本中的toolbar 
" set guioptions+=T
" set guioptions+=m

" 背景及配色方案 
if has('gui_running')
    set background=light
else
    set background=dark
endif

" 设置配色，这里选择的是desert，也有其他方案，在vim中输入:color 在敲tab键可以查看 
" color desert
" colorscheme solarized

"传说中的去掉边框用下边这一句
set go=

" 有时中文会显示乱码，用一下几条命令解决 
let &termencoding=&encoding
set fileencodings=utf-8,gb18030,gbk

" 高亮搜索
set hlsearch

" GUI尝试使用自定义字体
if has('gui_running')
    set guifont=DejaVu_Sans_Mono:h12:cDEFAULT,WenQuanYi_Micro_Hei:h12:cDEFAULT,Microsoft_Yahei:h12:cDEFAULT,Yahei_Mono:h12:cDEFAULT
     set guifontwide=DejaVu_Sans_Mono:h12:cDEFAULT,WenQuanYi_Micro_Hei_Mono:h12:cDEFAULT,Yahei_Mono:h12:cDEFAULT,Microsoft_Yahei_UI:h12:cDEFAULT
endif

