/**
 * @file Hash.h
 * @brief 基本Hash算法
 *
 * @version 1.0
 * @author OWenT
 * @date 2013.05.07
 *
 * @history
 *
 *
 */

#ifndef _UTIL_HASH_HASH_H_
#define _UTIL_HASH_HASH_H_

#include <stddef.h>
#include <limits>
#include <cstring>
#include <stdint.h>

namespace util
{
    namespace hash
    {
        namespace core
        {
            template<typename Ty>
            inline const Ty fnv_magic_prime_number(Ty&)
            {
                if (sizeof(Ty) == 4)
                    return ((Ty)0x01000193);
                else if (sizeof(Ty) == 8)
                    return ((Ty)0x100000001b3ULL);

                return 0;
            }

            /**
             * @brief fnv-1 算法 （二进制）
             * @param [in] buf 二进制数据
             * @param [in] len 二进制长度
             * @param [in] hval 初始值
             * @return 返回的指定类型的值
             */
            template<typename Ty>
            Ty fnv_n_buf(const void *buf, size_t len, Ty hval = 0)
            {
                unsigned char *bp = (unsigned char *)buf;
                unsigned char *be = bp + len;
                Ty mn = fnv_magic_prime_number(hval);

                while (bp < be)
                {
                    hval *= mn;
                    hval ^= (Ty)*bp++;
                }

                return hval;
            }

            /**
             * @brief fnv-1a 算法 （二进制）
             * @param [in] buf 二进制数据
             * @param [in] len 二进制长度
             * @param [in] hval 初始值
             * @return 返回的指定类型的值
             */
            template<typename Ty>
            Ty fnv_n_buf_a(const void *buf, size_t len, Ty hval = 0)
            {
                unsigned char *bp = (unsigned char *)buf;
                unsigned char *be = bp + len;
                Ty mn = fnv_magic_prime_number(hval);

                while (bp < be)
                {
                    hval ^= (Ty)*bp++;
                    hval *= mn;
                }

                return hval;
            }
        }

        /**
         * fnv-1算法hash函数 （二进制）
         * @param [in] bin 二进制数据
         * @param [in] len 二进制长度
         * @param [in] hval 初始散列值
         * @return 散列值
         */
        template<typename THVal>
        THVal HashFNV1(const void* bin, size_t len, THVal hval = 0)
        {
            return core::fnv_n_buf(bin, len, hval);
        }


        /**
         * fnv-1a算法hash函数 （二进制）
         * @param [in] bin 二进制数据
         * @param [in] len 二进制长度
         * @param [in] hval 初始散列值
         * @return 散列值
         */
        template<typename THVal>
        THVal HashFNV1A(const void* bin, size_t len, THVal hval = 0)
        {
            return core::fnv_n_buf_a(bin, len, hval);
        }

        /**
         * SDBM Hash函数
         * @param [in] bin 二进制数据
         * @param [in] len 二进制长度
         * @param [in] hval 初始散列值
         * @return 散列值
         */
        template<typename THVal>
        THVal HashSDBM(const void* bin, size_t len, THVal hval = 0)
        {
            unsigned char* strBuff = (unsigned char*)bin;
            size_t iIndex = 0;
            while (iIndex < len)
            {
                // equivalent to: hval = 65599 * hval + strBuff[iIndex ++]);
                hval = strBuff[iIndex ++] + (hval << 6) + (hval << 16) - hval;
            }
 
            return hval;
        }

        /**
         * RS Hash函数
         * @param [in] bin 二进制数据
         * @param [in] len 二进制长度
         * @param [in] hval 初始散列值
         * @return 散列值
         */
        template<typename THVal>
        THVal HashRS(const void* bin, size_t len, THVal hval = 0)
        {
            unsigned int b = 378551;
            unsigned int a = 63689;
            size_t iIndex = 0;
            unsigned char* strBuff = (unsigned char*)bin;

            while (iIndex < len)
            {
                hval = hval * a + strBuff[iIndex ++];
                a *= b;
            }
 
            return hval;
        }

        /**
         * JS Hash函数
         * @param [in] bin 二进制数据
         * @param [in] len 二进制长度
         * @param [in] hval 初始散列值
         * @return 散列值
         */
        template<typename THVal>
        THVal HashJS(const void* bin, size_t len, THVal hval = 1315423911)
        {
            size_t iIndex = 0;
            unsigned char* strBuff = (unsigned char*)bin;

            while (iIndex < len)
            {
                hval ^= ((hval << 5) + strBuff[iIndex ++] + (hval >> 2));
            }
 
            return hval;
        }

        /**
         * P. J. Weinberger Hash函数
         * @param [in] bin 二进制数据
         * @param [in] len 二进制长度
         * @param [in] hval 初始散列值
         * @return 散列值
         */
        template<typename THVal>
        THVal HashPJW(const void* bin, size_t len, THVal hval = 0)
        {
            size_t iIndex = 0;
            unsigned char* strBuff = (unsigned char*)bin;

            THVal BitsInUnignedInt = (THVal)(sizeof(THVal) * 8);
            THVal ThreeQuarters    = (THVal)((BitsInUnignedInt  * 3) / 4);
            THVal OneEighth        = (THVal)(BitsInUnignedInt / 8);
            THVal HighBits         = (THVal)(-1) << (BitsInUnignedInt - OneEighth);
            THVal test             = 0;
            while (iIndex < len)
            {
                hval = (hval << OneEighth) + strBuff[iIndex ++];
                if ((test = hval & HighBits) != 0)
                {
                    hval = ((hval ^ (test >> ThreeQuarters)) & (~HighBits));
                }
            }
 
            return hval;
        }

        /**
         * ELF Hash函数
         * @param [in] bin 二进制数据
         * @param [in] len 二进制长度
         * @param [in] hval 初始散列值
         * @return 散列值
         */
        template<typename THVal>
        THVal HashELF(const void* bin, size_t len, THVal hval = 0)
        {
            size_t iIndex = 0;
            unsigned char* strBuff = (unsigned char*)bin;

            THVal x = 0;
            while (iIndex < len)
            {
                hval = (hval << 4) + strBuff[iIndex ++];
                if ((x = hval & 0xF0000000L) != 0)
                {
                    hval ^= (x >> 24);
                    hval &= ~x;
                }
            }
 
            return hval;
        }

        /**
         * BKDR Hash函数
         * @param [in] bin 二进制数据
         * @param [in] len 二进制长度
         * @param [in] hval 初始散列值
         * @return 散列值
         */
        template<typename THVal>
        THVal HashBKDR(const void* bin, size_t len, THVal hval = 0)
        {
            size_t iIndex = 0;
            unsigned char* strBuff = (unsigned char*)bin;

            THVal seed = 131; // 31 131 1313 13131 131313 etc..
            while (iIndex < len)
            {
                hval = hval * seed + strBuff[iIndex ++];
            }
 
            return hval;
        }

        /**
         * DJB Hash函数
         * @param [in] bin 二进制数据
         * @param [in] len 二进制长度
         * @param [in] hval 初始散列值
         * @return 散列值
         */
        template<typename THVal>
        THVal HashDJB(const void* bin, size_t len, THVal hval = 5381)
        {
            size_t iIndex = 0;
            unsigned char* strBuff = (unsigned char*)bin;

            while (iIndex < len)
            {
                hval += (hval << 5) + strBuff[iIndex ++];
            }
 
            return hval;
        }

        /**
         * AP Hash函数
         * @param [in] bin 二进制数据
         * @param [in] len 二进制长度
         * @param [in] hval 初始散列值
         * @return 散列值
         */
        template<typename THVal>
        THVal HashAP(const void* bin, size_t len, THVal hval = 0)
        {
            size_t iIndex = 0;
            unsigned char* strBuff = (unsigned char*)bin;

            for (int i = 0; iIndex < len; i++)
            {
                if ((i & 1) == 0)
                {
                    hval ^= ((hval << 7) ^ strBuff[iIndex ++] ^ (hval >> 3));
                }
                else
                {
                    hval ^= (~((hval << 11) ^ strBuff[iIndex ++] ^ (hval >> 5)));
                }
            }
 
            return hval;
        }
    }
}

#endif /* HASH_H_ */
