/**
 * @file CompatSocket.h
 * @brief 兼容型Socket封装
 *        兼容Windows Socket和BSD Socket
 *        仅提供基本socket操作(测试用)
 * Licensed under the MIT licenses.
 *
 * @version 1.0
 * @author OWenT
 * @date 2013.04.26
 *
 * @history
 *
 */

#ifndef _UTIL_SOCKET_COMPAT_SOCKET_H__
#define _UTIL_SOCKET_COMPAT_SOCKET_H__

#ifdef WIN32
    #include <winsock.h>
    typedef int                socklen_t;
#else
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <netdb.h>
    #include <fcntl.h>
    #include <unistd.h>
    #include <sys/stat.h>
    #include <sys/types.h>
    #include <arpa/inet.h>
    #include <errno.h>
    #include <unistd.h>
    typedef int                SOCKET;

    //#pragma region define win32 const variable in linux
    #define INVALID_SOCKET    -1
    #define SOCKET_ERROR    -1
    //#pragma endregion
#endif

namespace util
{

    namespace socket
    {

        class CompatSocket 
        {

        public:
            CompatSocket(SOCKET sock = INVALID_SOCKET);
            ~CompatSocket();

            // set option
            int SetOption(int optmame, const void* optval, int optlen, int level = SOL_SOCKET);

            // Create socket object for snd/recv data
            bool Create(int af = PF_INET, int type = SOCK_STREAM, int protocol = 0);

            // Connect socket
            bool Connect(const char* ip, unsigned short port);
            // #region server
            // Bind socket
            bool Bind(unsigned short port);

            // Listen socket
            bool Listen(int backlog = 5); 

            // Accept socket
            bool Accept(CompatSocket& s, char* fromip = NULL);
            // #endregion
            
            // Send socket
            int Send(const char* buf, int len, int iMicroSeconds = 0);

            // Recv socket
            int Recv(char* buf, int len, int iMicroSeconds = 0);
            
            // Close socket
            int Close();

            // Get errno
            int GetError();
            
            //#pragma region just for win32
            // Init winsock DLL 
            static int Init();    
            // Clean winsock DLL
            static int Clean();
            //#pragma endregion

            // Domain parse
            static bool DnsParse(const char* domain, char* ip);

            CompatSocket& operator = (SOCKET s);

            operator SOCKET ();

        protected:
            SOCKET m_uSock;

        };

    }
}

#endif
