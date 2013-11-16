#include <fstream>
#include <algorithm>
#include <cstring>

#include "Config/INILoader.h"

namespace util
{
  namespace config
  {
      INIValue::INIValue()
      {
      }
  
      void INIValue::Add(const std::string& strVal)
      {
          m_stData.push_back(strVal);
      }
  
      void INIValue::Add(const char* begin, const char* end)
      {
          m_stData.push_back(std::string(begin, end));
      }
  
      bool INIValue::empty() const
      {
          return m_stData.empty() && m_stChirldren.empty();
      }
  
      bool INIValue::has_data() const
      {
          return false == m_stData.empty();
      }
  
      size_t INIValue::size() const
      {
          return m_stData.size();
      }
  
      void INIValue::clear()
      {
          m_stData.clear();
          m_stChirldren.clear();
      }
  
      INIValue& INIValue::operator[](const std::string strKey)
      {
          return m_stChirldren[strKey];
      }
  
      INIValue::node_type& INIValue::GetChildren()
      {
          return m_stChirldren;
      }
  
      const INIValue::node_type& INIValue::GetChildren() const
      {
          return m_stChirldren;
      }
  
      const std::string& INIValue::GetEmptyString()
      {
          static std::string strEmptyData;
          return strEmptyData;
      }
  
      const std::string& INIValue::AsCppString(size_t iIndex) const
      {
          if (iIndex < m_stData.size())
          {
              return m_stData[iIndex];
          }
  
          return GetEmptyString();
      }
  
      char INIValue::AsChar(size_t iIndex) const
      {
          return As<char>(iIndex);
      }
  
      short INIValue::AsShort(size_t iIndex) const
      {
          return As<short>(iIndex);
      }
  
      int INIValue::AsInt(size_t iIndex) const
      {
          return As<int>(iIndex);
      }
  
      long INIValue::AsLong(size_t iIndex) const
      {
          return As<long>(iIndex);
      }
  
      long long INIValue::AsLongLong(size_t iIndex) const
      {
          return As<long long>(iIndex);
      }
  
      double INIValue::AsDouble(size_t iIndex) const
      {
          return As<double>(iIndex);
      }
  
      float INIValue::AsFloat(size_t iIndex) const
      {
          return As<float>(iIndex);
      }
  
      const char* INIValue::AsString(size_t iIndex) const
      {
          return AsCppString(iIndex).c_str();
      }
  
      // ============ unsigned ============
      unsigned char INIValue::AsUChar(size_t iIndex) const
      {
          return As<unsigned char>(iIndex);
      }
  
      unsigned short INIValue::AsUShort(size_t iIndex) const
      {
          return As<unsigned short>(iIndex);
      }
  
      unsigned int INIValue::AsUInt(size_t iIndex) const
      {
          return As<unsigned int>(iIndex);
      }
  
      unsigned long INIValue::AsULong(size_t iIndex) const
      {
          return As<unsigned long>(iIndex);
      }
  
      unsigned long long INIValue::AsULongLong(size_t iIndex) const
      {
          return As<unsigned long long>(iIndex);
      }
  
      int8_t INIValue::AsInt8(size_t iIndex) const
      {
          return static_cast<int8_t>(AsInt(iIndex));
      }
  
      uint8_t INIValue::AsUInt8(size_t iIndex) const
      {
          return static_cast<uint8_t>(AsUInt(iIndex));
      }
  
      int16_t INIValue::AsInt16(size_t iIndex) const
      {
          return As<int16_t>(iIndex);
      }
  
      uint16_t INIValue::AsUInt16(size_t iIndex) const
      {
          return As<uint16_t>(iIndex);
      }
  
      int32_t INIValue::AsInt32(size_t iIndex) const
      {
          return As<int32_t>(iIndex);
      }
  
      uint32_t INIValue::AsUInt32(size_t iIndex) const
      {
          return As<uint32_t>(iIndex);
      }
  
      int64_t INIValue::AsInt64(size_t iIndex) const
      {
          return As<int64_t>(iIndex);
      }
  
      uint64_t INIValue::AsUInt64(size_t iIndex) const
      {
          return As<uint64_t>(iIndex);
      }
  
      namespace analysis
      {
          // space
          bool Space::TestChar(char c)
          {
              return (c == ' ' || c == '\r' || c == '\n' || c == '\t');
          }
  
          bool Space::Test(const char* begin, const char* end)
          {
              return begin < end && TestChar(*begin);
          }
  
          const char* Space::Parse(const char* begin, const char* end)
          {
              while (begin < end &&
                  TestChar(*begin)
                  )
              {
                  ++begin;
              }
  
              return begin;
          }
  
          // comment
          bool Comment::Test(const char* begin, const char* end)
          {
              return begin < end && ((*begin) == '#' || (*begin) == ';');
          }
  
          const char* Comment::Parse(const char* begin, const char* end)
          {
              if (false == Test(begin, end))
              {
                  return begin;
              }
  
              return end;
          }
  
          // identify
          bool Identify::Test(const char* begin, const char* end)
          {
              return begin < end;
          }
  
          const char* Identify::Parse(const char* begin, const char* end)
          {
              pBegin = pEnd = begin;
              if (false == Test(begin, end))
              {
                  return begin;
              }
              
              while (begin < end && (*begin) != ':' && (*begin) != '.' && (*begin) != '=')
              {
                  pEnd = (++begin);
              }
  
              // trim right
              while (pEnd > pBegin && Space::TestChar(*(pEnd - 1)))
                  --pEnd;
  
              return begin;
          }
  
          // key
          bool Key::Test(const char* begin, const char* end)
          {
              return begin < end;
          }
  
          const char* Key::Parse(const char* begin, const char* end)
          {
              while (begin < end)
              {
                  if (false == Test(begin, end))
                  {
                      return begin;
                  }
  
                  Identify stIdt;
                  begin = stIdt.Parse(begin, end);
                  if (stIdt.pBegin >= stIdt.pEnd)
                  {
                      return begin;
                  }
  
                  // 提取key
                  stKeys.push_back(std::make_pair(stIdt.pBegin, stIdt.pEnd));
  
                  Space stSplit;
                  begin = stSplit.Parse(begin, end);
  
                  if (begin >= end || (*begin) != '.')
                  {
                      return begin;
                  }
  
                  begin = stSplit.Parse(begin + 1, end);
              }
  
              return begin;
          }
  
          // section
          bool Section::Test(const char* begin, const char* end)
          {
              return begin < end && (*begin) == '[';
          }
  
          const char* Section::Parse(const char* begin, const char* end)
          {
              if (false == Test(begin, end))
              {
                  return begin;
              }
  
              ++begin;
              Space stSplit;
              while (begin < end)
              {
                  // trim left
                  begin = stSplit.Parse(begin, end);
                  const char* start = begin;
                  while (begin < end && (*begin) != ':' && (*begin) != ']')
                  {
                      ++begin;
                  }
  
                  // trim right
                  while (begin > start && Space::TestChar(*(begin - 1)))
                  {
                      --begin;
                  }
  
                  if (start < begin)
                  {
                      // 提取key
                      stKeys.push_front(std::make_pair(start, begin));
                  }
  
                  
                  begin = stSplit.Parse(begin, end);
  
                  if (begin >= end || (*begin) != ':')
                  {
                      // 略过结尾的 ] 字符
                      if (begin < end)
                      {
                          ++begin;
                      }
                      
                      break;
                  }
  
                  begin = stSplit.Parse(begin + 1, end);
              }
  
              return begin;
          }
  
          // string
          char String::arrConvertMap[1 << (sizeof(char) * 8)] = { 0 };
  
          void String::InitConverMap()
          {
              if (arrConvertMap[(int)'0'])
              {
                  return;
              }
  
              arrConvertMap[(int)'0'] = '\0';
              arrConvertMap[(int)'a'] = '\a';
              arrConvertMap[(int)'b'] = '\b';
              arrConvertMap[(int)'f'] = '\f';
              arrConvertMap[(int)'r'] = '\r';
              arrConvertMap[(int)'n'] = '\n';
              arrConvertMap[(int)'t'] = '\t';
              arrConvertMap[(int)'v'] = '\v';
              arrConvertMap[(int)'\\'] = '\\';
              arrConvertMap[(int)'\''] = '\'';
              arrConvertMap[(int)'\"'] = '\"';
          }
  
          bool String::Test(const char* begin, const char* end)
          {
              return begin < end && ((*begin) == '\'' || (*begin) == '\"');
          }
  
          const char* String::Parse(const char* begin, const char* end, bool bEnableConvert)
          {
              if (false == Test(begin, end))
              {
                  return begin;
              }
  
              InitConverMap();
              char cQuot = *(begin++);
  
              // 禁止转义字符串
              if (false == bEnableConvert)
              {
                  const char* start = begin;
                  while (begin < end && (*begin) != cQuot)
                  {
                      ++begin;
                  }
                  strValue.assign(start, begin);
  
                  // 封闭字符串
                  if (begin < end)
                  {
                      ++begin;
                  }
              }
              else // 允许转义的逻辑复杂一些
              {
                  while (begin < end && (*begin) != cQuot)
                  {
                      // 转义字符
                      if ((*begin) == '\\' && begin + 1 < end)
                      {
                          ++begin;
                          strValue += arrConvertMap[(int) *(begin++)];
                          continue;
                      }
  
                      // 普通字符
                      strValue += *(begin++);
                  }
  
                  // 封闭字符串
                  if (begin < end)
                  {
                      ++begin;
                  }
              }
  
              return begin;
          }
  
          // Value
          bool Value::Test(const char* begin, const char* end)
          {
              return begin < end;
          }
  
          const char* Value::Parse(const char* begin, const char* end)
          {
              if (false == Test(begin, end))
              {
                  return begin;
              }
  
              // trim left
              Space stSplit;
              begin = stSplit.Parse(begin, end);
  
              String strRule;
              Comment stComment;
              while (begin < end)
              {
                  
                  if (strRule.Test(begin, end))
                  {
                      strRule.strValue.clear();
                      begin = strRule.Parse(begin, end, (*begin) == '\"');
                      strValue += strRule.strValue;
                      continue;
                  }
  
                  if (stComment.Test(begin, end))
                  {
                      begin = stComment.Parse(begin, end);
                      continue;
                  }
  
                  strValue += *(begin++);
              }
  
              // trim right
              size_t iLen = strValue.size();
              while (iLen > 0)
              {
                  if (false == Space::TestChar(strValue[iLen - 1]))
                  {
                      break;
                  }
  
                  --iLen;
              }
  
              strValue = strValue.substr(0, iLen);
  
              return begin;
          }
  
          // Expression
          bool Expression::Test(const char* begin, const char* end)
          {
              return stKey.Test(begin, end);
          }
  
          const char* Expression::Parse(const char* begin, const char* end)
          {
              if (false == Test(begin, end))
              {
                  return begin;
              }
  
              Space stSplit;
  
              begin = stKey.Parse(begin, end);
              begin = stSplit.Parse(begin, end);
  
              if (begin >= end || (*begin) != '=')
              {
                  return begin;
              }
  
              begin = stSplit.Parse(begin + 1, end);
  
              return stValue.Parse(begin, end);
          }
  
          // Sentence
          bool Sentence::Test(const char* begin, const char* end)
          {
              return begin < end;
          }
  
          const char* Sentence::Parse(const char* begin, const char* end)
          {
              stSect.first = false;
              stExp.first = false;
  
              if (false == Test(begin, end))
              {
                  return begin;
              }
  
              Space stSplit;
              begin = stSplit.Parse(begin, end);
  
              // 空语句
              if (begin >= end)
              {
                  return begin;
              }
  
              // 纯注释语句
              Comment stCom;
              if (stCom.Test(begin, end))
              {
                  return stCom.Parse(begin, end);
              }
  
              // Section语句
              stSect.first = stSect.second.Test(begin, end);
              if (stSect.first)
              {
                  return stSect.second.Parse(begin, end);
              }
  
              // Expression语句
              stExp.first = stExp.second.Test(begin, end);
              if (stExp.first)
              {
                  return stExp.second.Parse(begin, end);
              }
  
              return begin;
          }
      }
  
      INILoader::INILoader()
      {
          m_pCurrentNode = &m_stRoot;
      }
  
      INILoader::~INILoader()
      {
      }
  
      int INILoader::LoadFile(const std::string strFilePath, bool bIsAppend)
      {
          std::fstream stFile;
          stFile.open(strFilePath.c_str(), std::ios::in);
          if (false == stFile.is_open())
          {
              return EIEC_OPENFILE;
          }
  
          if (false == bIsAppend)
          {
              Clear();
          }
  
          std::string strLine;
          while (std::getline(stFile, strLine))
          {
              analysis::Sentence stSentence;
              stSentence.Parse(strLine.c_str(), strLine.c_str() + strLine.size());
  
              // section 节点会改变当前配置区域
              if (stSentence.stSect.first)
              {
                  m_pCurrentNode = &GetRootNode();
                  analysis::Section::list_type::iterator iter = stSentence.stSect.second.stKeys.begin();
                  for (; iter != stSentence.stSect.second.stKeys.end(); ++iter)
                  {
                      if (iter->first >= iter->second)
                      {
                          continue;
                      }
  
                      std::string strKey;
                      strKey.assign(iter->first, iter->second);
                      m_pCurrentNode = &GetNode(strKey, m_pCurrentNode);
                  }
              }
  
              // expression 节点为配置值
              if (stSentence.stExp.first)
              {
                  INIValue* pOprNode = &GetSection();
                  analysis::Key::list_type::iterator iter = stSentence.stExp.second.stKey.stKeys.begin();
                  for (; iter != stSentence.stExp.second.stKey.stKeys.end(); ++iter)
                  {
                      if (iter->first >= iter->second)
                      {
                          continue;
                      }
  
                      std::string strKey;
                      strKey.assign(iter->first, iter->second);
                      pOprNode = &GetNode(strKey, pOprNode);
                  }
  
                  pOprNode->Add(stSentence.stExp.second.stValue.strValue);
              }
          }
  
          return EIEC_SUCCESS;
      }
  
      void INILoader::Clear()
      {
          m_pCurrentNode = &m_stRoot;
          m_stRoot.clear();
      }
  
      void INILoader::SetSection(const std::string& strPath)
      {
          m_pCurrentNode = &GetNode(strPath, &GetRootNode());
      }
  
      INIValue& INILoader::GetSection()
      {
          return *m_pCurrentNode;
      }
  
      const INIValue& INILoader::GetSection() const
      {
          return *m_pCurrentNode;
      }
  
  
      INIValue& INILoader::GetRootNode()
      {
          return m_stRoot;
      }
  
      const INIValue& INILoader::GetRootNode() const
      {
          return m_stRoot;
      }
  
      INIValue& INILoader::GetNode(const std::string& strPath, INIValue* pFather)
      {
          if (NULL == pFather)
          {
              pFather = &m_stRoot;
          }
  
          analysis::Key stKeys;
          const char* begin = strPath.c_str();
          const char* end = begin + strPath.size();
  
          analysis::Space stSpliter;
          begin = stSpliter.Parse(begin, end);
  
          begin = stKeys.Parse(begin, end);
          analysis::Section::list_type::iterator iter = stKeys.stKeys.begin();
          for (; iter != stKeys.stKeys.end(); ++iter)
          {
              if (iter->first >= iter->second)
              {
                  continue;
              }
  
              std::string strKey;
              strKey.assign(iter->first, iter->second);
              pFather = &GetChildNode(strKey, pFather);
          }
  
          return *pFather;
      }
  
      INIValue& INILoader::GetChildNode(const std::string& strPath, INIValue* pFather)
      {
          if (NULL == pFather)
          {
              pFather = &m_stRoot;
          }
  
          return (*pFather)[strPath];
      }
  
      void INILoader::DumpTo(const std::string& strPath, bool& stVal, bool bIsForce, size_t iIndex)
      {
          INIValue& stNode = GetNode(strPath);
  
          if (false == stNode.has_data() && false == bIsForce)
          {
              return;
          }
  
          // no data
          if (false == stNode.has_data() && bIsForce)
          {
              stVal = false;
              return;
          }
  
          std::string strTrans = stNode.AsCppString(iIndex);
          std::transform(strTrans.begin(), strTrans.end(), strTrans.begin(), ::tolower);
          stVal = true;
  
          if ("0" == strTrans || "false" == strTrans || "no" == strTrans || "disable" == strTrans || "disabled" == strTrans)
          {
              stVal = false;
          }
      }
  
      void INILoader::DumpTo(const std::string& strPath, std::string& stVal, bool bIsForce, size_t iIndex)
      {
          INIValue& stNode = GetNode(strPath);
          if (stNode.has_data() || bIsForce)
          {
              stVal = stNode.AsCppString(iIndex);
          }
      }
  
      void INILoader::DumpTo(const std::string& strPath, char* stVal, size_t MAX_COUNT, bool bIsForce, size_t iIndex)
      {
          INIValue& stNode = GetNode(strPath);
          if (stNode.has_data() || bIsForce)
          {
              const std::string& strVal = stNode.AsCppString(iIndex);
              strncpy(stVal, strVal.c_str(), MAX_COUNT);
          }
      }
  }
  
}
