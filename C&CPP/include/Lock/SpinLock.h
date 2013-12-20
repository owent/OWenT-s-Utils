/**
 * @file SpinLock.h
 * @brief 自旋锁
 *
 *
 * @version 1.0
 * @author OWenT
 * @date 2013-3-18
 *
 * @note VC 2012+, GCC 4.4 + 使用C++0x/11实现实现原子操作
 * @note 低版本 VC使用InterlockedExchange等实现原子操作
 * @note 低版本 GCC采用__sync_lock_test_and_set等实现原子操作
 *
 * @history
 *     2013-12-20
 *         1. add support for clang & intel compiler
 *         2. add try unlock function
 *
 */

#ifndef _UTIL_LOCK_SPINLOCK_H_
#define _UTIL_LOCK_SPINLOCK_H_

#if defined(_MSC_VER) && (_MSC_VER >= 1020)
# pragma once
#endif

#if defined(__clang__) && (__clang_major__ > 3 || (__clang_major__ == 3 && __clang_minor__ >= 1 ) ) && __cplusplus >= 201103L
    #include <atomic>
    #define __BASELIB_LOCK_SPINLOCK_ATOMIC_STD
#elif defined(_MSC_VER) && (_MSC_VER >= 1700) && defined(_HAS_CPP0X) && _HAS_CPP0X
    #include <atomic>
    #define __BASELIB_LOCK_SPINLOCK_ATOMIC_STD
#elif defined(__GNUC__) && __GNUC__ >= 4 && __GNUC_MINOR__ >= 5 && (__cplusplus >= 201103L || defined(__GXX_EXPERIMENTAL_CXX0X__))
    #include <atomic>
    #define __BASELIB_LOCK_SPINLOCK_ATOMIC_STD
#endif

namespace util
{
    namespace lock
    {

        // C++ 0x/11版实现
        #ifdef __BASELIB_LOCK_SPINLOCK_ATOMIC_STD
        class SpinLock
        {
        private:
          typedef enum {Unlocked = 0, Locked = 1} LockState;
          std::atomic<LockState> m_enStatus;

        public:
          SpinLock() : m_enStatus(Unlocked) {}

          void Lock()
          {
              while (m_enStatus.exchange(Locked, std::memory_order_acquire) == Locked); /* busy-wait */
          }

          void Unlock()
          {
              m_enStatus.store(Unlocked, std::memory_order_release);
          }

          bool IsLocked()
          {
              return m_enStatus.load(std::memory_order_acquire) == Locked;
          }

          bool TryLock()
          {
              return m_enStatus.exchange(Locked, std::memory_order_acquire) == Unlocked;
          }
          
          bool TryUnlock()
          {
              return m_enStatus.exchange(Unlocked, std::memory_order_acquire) == Locked;
          }

        };
        #else

        #if defined(__clang__)
            #if !defined(__GCC_ATOMIC_INT_LOCK_FREE) && (!defined(__GNUC__) || __GNUC__ < 4 || (__GNUC__ == 4 && __GNUC_MINOR__ < 1))
                #error Clang version is too old
            #endif
            #define __BASELIB_LOCK_SPINLOCK_ATOMIC_GCC 1
        #elif defined(_MSC_VER)
            #include <WinBase.h>
            #define __BASELIB_LOCK_SPINLOCK_ATOMIC_MSVC 1
            
        #elif defined(__GNUC__) || defined(__clang__) || defined(__clang__) || defined(__INTEL_COMPILER)
            #if defined(__GNUC__) && (__GNUC__ < 4 || (__GNUC__ == 4 && __GNUC_MINOR__ < 1))
                #error GCC version must be greater or equal than 4.1
            #endif
            
            #if defined(__INTEL_COMPILER) && __INTEL_COMPILER < 1100
                #error Intel Compiler version must be greater or equal than 11.0
            #endif
            #define __BASELIB_LOCK_SPINLOCK_ATOMIC_GCC 1
        #else
            #error Currently only gcc, msvc, intel compiler & llvm-clang are supported
        #endif

        class SpinLock
        {
        private:
          typedef enum {Unlocked = 0, Locked = 1} LockState;
          volatile unsigned int m_enStatus;

        public:
          SpinLock() : m_enStatus(Unlocked) {}

          void Lock()
          {
            #ifdef __BASELIB_LOCK_SPINLOCK_ATOMIC_MSVC
                while(InterlockedExchange(&m_enStatus, Locked) == Locked); /* busy-wait */
            #else
                while(__sync_lock_test_and_set(&m_enStatus, Locked) == Locked); /* busy-wait */
            #endif
          }

          void Unlock()
          {
            #ifdef __BASELIB_LOCK_SPINLOCK_ATOMIC_MSVC
              InterlockedExchange(&m_enStatus, Unlocked);
            #else
              __sync_lock_release(&m_enStatus, Unlocked);
            #endif
          }

          bool IsLocked()
          {
            #ifdef __BASELIB_LOCK_SPINLOCK_ATOMIC_MSVC
              return InterlockedExchangeAdd(&m_enStatus, 0) == Locked;
            #else
              return __sync_add_and_fetch(&m_enStatus, 0) == Locked;
            #endif
          }

          bool TryLock()
          {

            #ifdef __BASELIB_LOCK_SPINLOCK_ATOMIC_MSVC
              return InterlockedExchange(&m_enStatus, Locked) == Unlocked;
            #else
              return __sync_lock_test_and_set(&m_enStatus, Locked) == Unlocked;
            #endif
          }
          
          bool TryUnlock()
          {
            #ifdef __BASELIB_LOCK_SPINLOCK_ATOMIC_MSVC
              return InterlockedExchange(&m_enStatus, Unlocked) == Locked;
            #else
              return __sync_lock_test_and_set(&m_enStatus, Unlocked) == Locked;
            #endif
          }

        };

        #endif

    }
}

#endif /* SPINLOCK_H_ */
