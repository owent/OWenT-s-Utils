/**
 * @file INILoader.h
 * @brief INI解析器
 * Licensed under the MIT licenses.
 *
 * @note 与标准INI有略微不同，请注意
 * 1. 支持Section
 * 2. Secion支持父子关系,即 [ A : B : C ] 语法
 * 3. 支持多重父子关系,如 C.B.A = d
 * 4. 支持字符串转义，其中以'包裹的不进行转义，以"包裹的可进行转义,如 C.B.A = "Hello \r\n World!\0"
 * 5. 配置的Key名称不能包含引号('和")、点(.)、冒号(:)和方括号([])
 * 6. 配置的Key名称区分大小写
 * 7. #符号也将是做行注释，与 ; 等价
 *
 * @version 1.0
 * @author owentou, owentou@tencent.com
 * @date 2013年11月16日
 *
 * @history
 *
 */

#ifndef _UTIL_CONFIG_INILOADER_H_
#define _UTIL_CONFIG_INILOADER_H_

#if defined(_MSC_VER) && (_MSC_VER >= 1020)
# pragma once
#endif

#include <stdint.h>
#include <string>
#include <sstream>
#include <map>
#include <list>
#include <vector>

namespace util
{
  namespace config
  {
      // ================= 错误码 =================
      enum EN_INILOADER_ERROR_CODE
      {
          EIEC_SUCCESS = 0,
          EIEC_OPENFILE = -1,
      };
      // ----------------- 错误码 -----------------
  
      // ================= 存储层 =================
      class INIValue
      {
      public:
          typedef std::map<std::string, INIValue> node_type;
      private:
          std::vector<std::string> m_stData;
          node_type m_stChirldren;
  
          template<typename _Tt>
          inline _Tt string2any(const char* strData) const
          {
              _Tt ret;
              std::stringstream stStream;
              stStream.str(strData);
              stStream >> ret;
              return ret;
          }
  
      public:
          INIValue();
  
          void Add(const std::string& strVal);
          void Add(const char* begin, const char* end);
  
          // 节点操作
          bool empty() const; // like stl
          bool has_data() const; // like stl
          size_t size() const; // like stl
          void clear(); // like stl
          INIValue& operator[](const std::string strKey);
          node_type& GetChildren();
          const node_type& GetChildren() const;
  
          static const std::string& GetEmptyString();
  
          // 数值转换操作
          template<typename _Tt>
          inline _Tt As(size_t iIndex = 0) const
          {
              if (iIndex < m_stData.size())
              {
                  return string2any<_Tt>(m_stData[iIndex].c_str());
              }
  
              return string2any<_Tt>(GetEmptyString().c_str());
          }
  
          // 获取存储对象的字符串
          const std::string& AsCppString(size_t iIndex = 0) const;
  
          char AsChar(size_t iIndex = 0) const;
  
          short AsShort(size_t iIndex = 0) const;
  
          int AsInt(size_t iIndex = 0) const;
  
          long AsLong(size_t iIndex = 0) const;
  
          long long AsLongLong(size_t iIndex = 0) const;
  
          double AsDouble(size_t iIndex = 0) const;
  
          float AsFloat(size_t iIndex = 0) const;
  
          const char* AsString(size_t iIndex = 0) const;
  
          unsigned char AsUChar(size_t iIndex = 0) const;
  
          unsigned short AsUShort(size_t iIndex = 0) const;
  
          unsigned int AsUInt(size_t iIndex = 0) const;
  
          unsigned long AsULong(size_t iIndex = 0) const;
  
          unsigned long long AsULongLong(size_t iIndex = 0) const;
  
          int8_t AsInt8(size_t iIndex = 0) const;
  
          uint8_t AsUInt8(size_t iIndex = 0) const;
  
          int16_t AsInt16(size_t iIndex = 0) const;
  
          uint16_t AsUInt16(size_t iIndex = 0) const;
  
          int32_t AsInt32(size_t iIndex = 0) const;
  
          uint32_t AsUInt32(size_t iIndex = 0) const;
  
          int64_t AsInt64(size_t iIndex = 0) const;
  
          uint64_t AsUInt64(size_t iIndex = 0) const;
      };
      // ----------------- 存储层 -----------------
  
      // ================= 词法状态机 =================
      namespace analysis
      {
          // space
          struct Space
          {
              static bool TestChar(char c);
              bool Test(const char* begin, const char* end);
              const char* Parse(const char* begin, const char* end);
          };
  
          // comment
          struct Comment
          {
              bool Test(const char* begin, const char* end);
              const char* Parse(const char* begin, const char* end);
          };
  
          // identify
          struct Identify
          {
              const char* pBegin;
              const char* pEnd;
  
              bool Test(const char* begin, const char* end);
              const char* Parse(const char* begin, const char* end);
          };
  
          // key
          struct Key
          {
              typedef std::list<std::pair<const char*, const char*> > list_type;
              list_type stKeys;
  
              bool Test(const char* begin, const char* end);
              const char* Parse(const char* begin, const char* end);
          };
  
          // section
          struct Section
          {
              typedef std::list<std::pair<const char*, const char*> > list_type;
              list_type stKeys;
  
              bool Test(const char* begin, const char* end);
              const char* Parse(const char* begin, const char* end);
          };
  
          // string
          struct String
          {
              static char arrConvertMap [1<< (sizeof(char) * 8)];
              void InitConverMap();
  
              std::string strValue;
  
              bool Test(const char* begin, const char* end);
              const char* Parse(const char* begin, const char* end, bool bEnableConvert = false);
          };
  
          // Value
          struct Value
          {
              std::string strValue;
  
              bool Test(const char* begin, const char* end);
              const char* Parse(const char* begin, const char* end);
          };
  
          // Expression
          struct Expression
          {
              Key stKey;
              Value stValue;
  
              bool Test(const char* begin, const char* end);
              const char* Parse(const char* begin, const char* end);
          };
  
          // Sentence
          struct Sentence
          {
              std::pair<bool, Section> stSect;
              std::pair<bool, Expression> stExp;
  
              bool Test(const char* begin, const char* end);
              const char* Parse(const char* begin, const char* end);
          };
      }
      // ----------------- 词法状态机 -----------------
  
      class INILoader
      {
      private:
          INIValue m_stRoot; // root node
          INIValue* m_pCurrentNode;
  
      public:
          INILoader();
          ~INILoader();
  
          int LoadFile(const char* strFilePath, bool bIsAppend = false);
          
          int LoadFile(const std::string& strFilePath, bool bIsAppend = false);
  
          void Clear();
  
          void SetSection(const std::string& strPath);
  
          INIValue& GetSection();
  
          const INIValue& GetSection() const;
  
  
          INIValue& GetRootNode();
  
          const INIValue& GetRootNode() const;
  
          INIValue& GetNode(const std::string& strPath, INIValue* pFather = NULL);
  
          INIValue& GetChildNode(const std::string& strPath, INIValue* pFather = NULL);
  
          // ========================= 单值容器转储 ========================= 
          template<typename Ty>
          void DumpTo(const std::string& strPath, Ty& stVal, bool bIsForce = false, size_t iIndex = 0)
          {
              INIValue& stNode = GetNode(strPath);
              if (stNode.has_data() || bIsForce)
              {
                  stVal = stNode.As<Ty>(iIndex);
              }
          }
  
          void DumpTo(const std::string& strPath, bool& stVal, bool bIsForce = false, size_t iIndex = 0);
  
          void DumpTo(const std::string& strPath, std::string& stVal, bool bIsForce = false, size_t iIndex = 0);
  
          void DumpTo(const std::string& strPath, char* stVal, size_t MAX_COUNT, bool bIsForce = false, size_t iIndex = 0);
  
          template<size_t MAX_COUNT>
          void DumpTo(const std::string& strPath, char(&stVal)[MAX_COUNT], bool bIsForce = false, size_t iIndex = 0)
          {
              DumpTo(strPath, stVal, MAX_COUNT, bIsForce, iIndex);
          }
  
          // ========================= 多值容器转储 ========================= 
          template<typename Ty>
          void DumpTo(const std::string& strPath, std::vector<Ty>& stVal, bool bIsForce = false)
          {
              INIValue& stNode = GetNode(strPath);
              for (size_t i = 0; i < stNode.size(); ++i)
              {
                  stVal.push_back(Ty());
                  DumpTo(strPath, stVal.back(), bIsForce, i);
              }
          }
  
          template<typename Ty>
          void DumpTo(const std::string& strPath, std::list<Ty>& stVal, bool bIsForce = false)
          {
              INIValue& stNode = GetNode(strPath);
              for (size_t i = 0; i < stNode.size(); ++i)
              {
                  stVal.push_back(Ty());
                  DumpTo(strPath, stVal.back(), bIsForce, i);
              }
          }
  
          template<typename Ty, size_t MAX_COUNT>
          void DumpTo(const std::string& strPath, Ty (&stVal)[MAX_COUNT], bool bIsForce = false)
          {
              INIValue& stNode = GetNode(strPath);
              for (size_t i = 0; i < stNode.size() && i < MAX_COUNT; ++i)
              {
                  DumpTo(strPath, stVal[i], bIsForce, i);
              }
          }
  
          template<typename Ty>
          void DumpTo(const std::string& strPath, Ty* stVal, size_t MAX_COUNT, bool bIsForce = false)
          {
              INIValue& stNode = GetNode(strPath);
              for (size_t i = 0; i < stNode.size() && i < MAX_COUNT; ++i)
              {
                  DumpTo(strPath, stVal[i], bIsForce, i);
              }
          }
      };
  }
}

#endif
