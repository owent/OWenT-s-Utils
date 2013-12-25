// Licensed under the MIT licenses.
#include <cstdio>
#include <iostream>
#include "Socket/CompatSocket.h"

#if defined(_MSC_VER) && defined(WIN32)
    #pragma comment(lib, "wsock32")
#endif


namespace util
{

    namespace socket
    {
    
        CompatSocket::CompatSocket(SOCKET sock)
        {
            m_uSock = sock;
        }

        CompatSocket::~CompatSocket()
        {
            Close();
        }

        int CompatSocket::Init()
        {
            static int ret = -1;
        #ifdef WIN32
            if (0 == ret)
            {
                return ret;
            }
            /*
            http://msdn.microsoft.com/zh-cn/vstudio/ms741563(en-us,VS.85).aspx

            typedef struct WSAData { 
                WORD wVersion;                                //winsock version
                WORD wHighVersion;                            //The highest version of the Windows Sockets specification that the Ws2_32.dll can support
                char szDescription[WSADESCRIPTION_LEN+1]; 
                char szSystemStatus[WSASYSSTATUS_LEN+1]; 
                unsigned short iMaxSockets; 
                unsigned short iMaxUdpDg; 
                char FAR * lpVendorInfo; 
            }WSADATA, *LPWSADATA; 
            */
            WSADATA wsaData;
            //#define MAKEWORD(a,b) ((WORD) (((BYTE) (a)) | ((WORD) ((BYTE) (b))) << 8)) 
            WORD version = MAKEWORD(2, 0);
            ret = WSAStartup(version, &wsaData);//win sock start up
            if ( ret ) {
                std::cerr << "Initilize winsock error !" << std::endl;
            }
        #else
            ret = 0;
        #endif
            
            return ret;
        }
        //this is just for windows
        int CompatSocket::Clean()
        {
        #ifdef WIN32
            return (WSACleanup());
        #endif
            return 0;
        }

        CompatSocket& CompatSocket::operator = (SOCKET s)
        {
            m_uSock = s;
            return (*this);
        }

        CompatSocket::operator SOCKET ()
        {
            return m_uSock;
        }

        int CompatSocket::SetOption(int optmame, const void* optval, int optlen, int level)
        {
            #ifdef WIN32
                return setsockopt(m_uSock, level, optmame, static_cast<const char*>(optval), optlen);
            #else
                return setsockopt(m_uSock, level, optmame, optval, optlen);
            #endif
        }

        //create a socket object win/lin is the same
        // af:
        bool CompatSocket::Create(int af, int type, int protocol)
        {
            m_uSock = ::socket(af, type, protocol);
            if ( m_uSock == INVALID_SOCKET ) {
                return false;
            }
            return true;
        }

        bool CompatSocket::Connect(const char* ip, unsigned short port)
        {
            struct sockaddr_in svraddr;
            svraddr.sin_family = AF_INET;
            svraddr.sin_addr.s_addr = inet_addr(ip);
            svraddr.sin_port = htons(port);
            int ret = connect(m_uSock, (struct sockaddr*)&svraddr, sizeof(svraddr));
            if ( ret == SOCKET_ERROR ) {
                return false;
            }
            return true;
        }

        bool CompatSocket::Bind(unsigned short port)
        {
            struct sockaddr_in svraddr;
            svraddr.sin_family = AF_INET;
            svraddr.sin_addr.s_addr = INADDR_ANY;
            svraddr.sin_port = htons(port);

            int opt =  1;
            if ( setsockopt(m_uSock, SOL_SOCKET, SO_REUSEADDR, (char*)&opt, sizeof(opt)) < 0 ) 
                return false;

            int ret = bind(m_uSock, (struct sockaddr*)&svraddr, sizeof(svraddr));
            if ( ret == SOCKET_ERROR ) {
                return false;
            }
            return true;
        }
        //for server
        bool CompatSocket::Listen(int backlog)
        {
            int ret = listen(m_uSock, backlog);
            if ( ret == SOCKET_ERROR ) {
                return false;
            }
            return true;
        }

        bool CompatSocket::Accept(CompatSocket& s, char* fromip)
        {
            struct sockaddr_in cliaddr;
            socklen_t addrlen = sizeof(cliaddr);
            SOCKET sock = accept(m_uSock, (struct sockaddr*)&cliaddr, &addrlen);
            if ( static_cast<int>(sock) == static_cast<int>(SOCKET_ERROR) ) {
                return false;
            }

            s = sock;
            if ( fromip != NULL )
                sprintf(fromip, "%s", inet_ntoa(cliaddr.sin_addr));

            return true;
        }

        int CompatSocket::Send(const char* buf, int len, int iMicroSeconds)
        {
            //·Ç×èÈûsend 
            fd_set wset;
            FD_ZERO(&wset);
            FD_SET(m_uSock, &wset); 
            struct timeval tm;
            tm.tv_sec = 0;
            tm.tv_usec = iMicroSeconds;

            int iRet = select(m_uSock + 1, NULL, &wset, NULL, &tm);
            if (iRet == 0)
            {
                // Time out
                return -1;
            }

            if (!FD_ISSET(m_uSock, &wset))
            {
                return -2;
            }

            #ifdef WIN32
                iRet = send(m_uSock, buf, len, 0);
            #else
                iRet = send(m_uSock, buf, static_cast<size_t>(len), 0);
            #endif
                
            if (iRet < 0)
            {
                return iRet;
            }

            return iRet;
        }

        int CompatSocket::Recv(char* buf, int len, int iMicroSeconds)
        {
            //·Ç×èÈûrecv 
            fd_set rset;
            FD_ZERO(&rset);
            FD_SET(m_uSock, &rset); 
            struct timeval tm;
            tm.tv_sec = 0;
            tm.tv_usec = iMicroSeconds;


            int iRet = select(m_uSock + 1, &rset, NULL, NULL, &tm);
            if (iRet == 0)
            {
                // Time out
                return -1;
            }

            if (!FD_ISSET(m_uSock, &rset))
            {
                return -2;
            }

            #ifdef WIN32
                iRet = recv(m_uSock, buf, len, 0);
            #else
                iRet = recv(m_uSock, buf, static_cast<size_t>(len), 0);
            #endif
                
            if (iRet < 0)
            {
                return iRet;
            }

            return iRet;
        }

        int CompatSocket::Close()
        {
            SOCKET uSock = m_uSock;
            m_uSock = INVALID_SOCKET;

        #ifdef WIN32
            return (closesocket(uSock));
        #else
            return (close(uSock));
        #endif
        }

        int CompatSocket::GetError()
        {
        #ifdef WIN32
            return (WSAGetLastError());
        #else
            return (errno);
        #endif
        }

        bool CompatSocket::DnsParse(const char* domain, char* ip)
        {
            struct hostent* p;
            if ( (p = gethostbyname(domain)) == NULL )
                return false;
                
            sprintf(ip, 
                "%u.%u.%u.%u",
                (unsigned char)p->h_addr_list[0][0], 
                (unsigned char)p->h_addr_list[0][1], 
                (unsigned char)p->h_addr_list[0][2], 
                (unsigned char)p->h_addr_list[0][3]);
            
            return true;
        }
    }
}
