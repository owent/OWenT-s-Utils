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
 *
 */

#ifndef _UTIL_LOCK_SPINLOCK_H_
#define _UTIL_LOCK_SPINLOCK_H_

#if defined(_MSC_VER) && (_MSC_VER >= 1020)
# pragma once
#endif

#if defined(_MSC_VER) && (_MSC_VER >= 1700)
    #include <atomic>
    #define __BASELIB_LOCK_SPINLOCK_ATOMIC_STD
#elif defined(__GNUC__) && __GNUC__ >= 4 && __GNUC_MINOR__ >= 5 && defined(__GXX_EXPERIMENTAL_CXX0X__)
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
              return m_enStatus.load(std::memory_order_release) == Locked;
          }

          bool TryLock()
          {
              return m_enStatus.exchange(Locked, std::memory_order_acquire) == Unlocked;
          }

        };
        #else

        #ifdef _MSC_VER
            #include <WinBase.h>
        #elif defined(__GNUC__)
            #if __GNUC__ < 4 || (__GNUC__ == 4 && __GNUC_MINOR__ < 1)
            #error GCC version must be greater or equal than 4.1.2
        #endif
            #include <sched.h>
        #else
            #error Currently only windows and linux os are supported
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
            #ifdef _MSC_VER
                while(InterlockedExchange(&m_enStatus, Locked) == Locked); /* busy-wait */
            #elif defined(__GNUC__)
                while(__sync_lock_test_and_set(&m_enStatus, Locked) == Locked); /* busy-wait */
            #endif
          }

          void Unlock()
          {

            #ifdef _MSC_VER
              InterlockedExchange(&m_enStatus, Unlocked);
            #elif defined(__GNUC__)
              __sync_lock_release(&m_enStatus, Unlocked);
            #endif
          }

          bool IsLocked()
          {
            #ifdef _MSC_VER
              return InterlockedExchangeAdd(&m_enStatus, 0) == Locked;
            #elif defined(__GNUC__)
              return __sync_add_and_fetch(&m_enStatus, 0) == Locked;
            #endif
          }

          bool TryLock()
          {

            #ifdef _MSC_VER
              return InterlockedExchange(&m_enStatus, Locked) == Unlocked;
            #elif defined(__GNUC__)
              return __sync_lock_test_and_set(&m_enStatus, Locked) == Unlocked;
            #endif
          }

        };

        #endif

    }
}

#endif /* SPINLOCK_H_ */
