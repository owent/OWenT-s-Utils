using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using System.Threading;
using System.Collections;
using System.Windows.Threading;

/**
 * Silverlight音乐播放器
 * By OWenT
 * http://www.owent.net/
 */
namespace Player
{
    public partial class MainPage : UserControl
    {
        #region 成员变量
        static String AppName = "Silverlight播放器( By OWenT )  -- ";
        String attachTitle = "";
        String mainTitle = AppName;
        IDictionary<string, string> parameter;
        List<PlayListNode> playList = new List<PlayListNode>();
        Int32 playPosition = 0;
        DispatcherTimer timeRCD = new DispatcherTimer();
        #endregion

        public MainPage(IDictionary<string, string> parIn)
        {
            InitializeComponent();
            #region 初始化
            SLD_Volume.Value = 0.5;
            SLD_Volume_ValueChanged(null, null);
            parameter = parIn;

            //获取播放列表
            if (parameter.Keys.Contains("msUrl"))
                playList.Add(new PlayListNode(parameter["msUrl"]));
            if (parameter.Keys.Contains("msNum"))
            {
                Int32 len = Int32.Parse(parameter["msNum"]);
                for (Int32 i = 0; i <= len; i++)
                    if (parameter.Keys.Contains("msUrl" + i.ToString()))
                        playList.Add(new PlayListNode(parameter["msUrl" + i.ToString()]));
            }
            for (Int32 i = 0; i < playList.Count; i++)
            {
                int lgp = playList[i].Url.LocalPath.LastIndexOf("/") + 1;
                playList[i].FileName = playList[i].Url.LocalPath.Substring(lgp, playList[i].Url.LocalPath.Length - lgp);
            }

            //初始化播放歌曲
            Player_InitPlayMedia(0);
            if (parameter.Keys.Contains("autoPlay") && parameter["autoPlay"].Equals("true"))
                Player.AutoPlay = true;
            else
                Player.AutoPlay = false;

            //初始化时钟
            timeRCD.Interval = new TimeSpan(0, 0, 0, 0, 500);
            timeRCD.Tick += new EventHandler(timeRCDTimer_Tick);
            timeRCD.Start();
            #endregion
        }

        #region 时间事件
        void timeRCDTimer_Tick(object sender, EventArgs e)
        {
            TimeSpan ts_show = Player.Position;
            TimeSpan ts_tol = Player.NaturalDuration.TimeSpan;

            TBK_Time_Total.Text = String.Format("/ {0:00}:{1:00}:{2:00}"
                , ts_tol.Hours, ts_tol.Minutes, ts_tol.Seconds);
            TBK_Time_Run.Text = String.Format("{0:00}:{1:00}:{2:00}"
                , ts_show.Hours, ts_show.Minutes, ts_show.Seconds);

            PRB_Run_Time.Value = ts_show.TotalMilliseconds / ts_tol.TotalMilliseconds;
            if (Player.CurrentState == MediaElementState.Buffering)
            {
                TBK_Buffer.Visibility = System.Windows.Visibility.Visible;
                PRB_Buffer.Visibility = System.Windows.Visibility.Visible;
            }
            else
            {
                TBK_Buffer.Visibility = System.Windows.Visibility.Collapsed;
                PRB_Buffer.Visibility = System.Windows.Visibility.Collapsed;
            }
            if (Player.CurrentState == MediaElementState.Playing)
            {
                mainTitle += mainTitle[0];
                mainTitle = mainTitle.Remove(0, 1);
                TBK_Title.Text = mainTitle + attachTitle;
            }
        }
        #endregion

        #region 控件事件
        #region 功能性按钮事件
        private void BTN_Player_Click(object sender, RoutedEventArgs e)
        {
            Player.Play();
        }

        private void BTN_Stop_Click(object sender, RoutedEventArgs e)
        {
            Player.AutoPlay = false;
            Player_MediaSwitch(0);
        }

        private void SLD_Volume_ValueChanged(object sender, RoutedPropertyChangedEventArgs<double> e)
        {
            Player.Volume = SLD_Volume.Value;
            TBK_Volume_Show.Text = ((Int32)(Player.Volume * 100)).ToString() + "%";
        }

        private void BTN_Next_Click(object sender, RoutedEventArgs e)
        {
            Player_MediaSwitch(1);
        }

        private void BTN_Back_Click(object sender, RoutedEventArgs e)
        {
            Player_MediaSwitch(-1);
        }

        private void BTN_Pause_Click(object sender, RoutedEventArgs e)
        {
            attachTitle = " -- pause";
            Player.Pause();
        }
        #endregion

        #region 改变播放时间条事件
        private void PRB_Run_Time_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            double val = e.GetPosition(PRB_Run_Time).X / PRB_Run_Time.Width;
            int SliderValue = (int)(val * Player.NaturalDuration.TimeSpan.TotalMilliseconds);
            TimeSpan ts = new TimeSpan(0, 0, 0, 0, SliderValue);
            Player.Position = ts;
            PRB_Run_Time.Value = val;
        }
        #endregion

        #region 媒体元素事件
        private void Player_CurrentStateChanged(object sender, RoutedEventArgs e)
        {
            if (Player.CurrentState == MediaElementState.Playing)
            {
                Player_PlayMedia(true);
            }
            else
            {
                if (Player.CurrentState == MediaElementState.Paused)
                    Player_PlayMedia(false);
                else if (Player.CurrentState == MediaElementState.Closed)
                    mainTitle = AppName;
            }
            TBK_Title.Text = mainTitle + attachTitle;
        }

        private void Player_DownloadProgressChanged(object sender, RoutedEventArgs e)
        {
            PRB_Download.Value = Player.DownloadProgress;
        }

        private void Player_BufferingProgressChanged(object sender, RoutedEventArgs e)
        {
            PRB_Buffer.Value = Player.BufferingProgress;
        }

        private void Player_MediaEnded(object sender, RoutedEventArgs e)
        {
            Player.AutoPlay = true;
            Player_MediaSwitch(1);
        }
        #endregion
        #endregion

        #region 支持函数
        /// <summary>
        /// 切换音乐
        /// </summary>
        /// <param name="py">偏移量</param>
        private void Player_MediaSwitch(int py)
        {
            
            if (playList.Count > 0)
            {
                playPosition += py;
                playPosition %= playList.Count;
                Player_InitPlayMedia(playPosition);
            }
            mainTitle = AppName;
            TBK_Title.Text = mainTitle + attachTitle;
        }
        /// <summary>
        /// 初始化播放的媒体
        /// </summary>
        /// <param name="pos">媒体列表位置</param>
        private void Player_InitPlayMedia(int pos)
        {
            Player.Stop();
            if (pos < playList.Count)
            {
                playPosition = pos;
                Player.Source = playList[pos].Url;
                attachTitle = playList[pos].FileName;
            }
        }
        /// <summary>
        /// 播放
        /// </summary>
        /// <param name="pl">播放/暂停</param>
        /// <returns></returns>
        private void Player_PlayMedia(bool pl)
        {
            if (pl == false)
            {
                Player.AutoPlay = false;
            }
            else
            {
                mainTitle = playList[playPosition].FileName + "    ";
                attachTitle = " -- run";
                Player.AutoPlay = true;
            }
            TBK_Title.Text = mainTitle + attachTitle;
        }
        #endregion
    }

    #region 播放列表元素 
    public class PlayListNode
    {
        public Uri Url;
        public String FileName;
        public PlayListNode()
        {
        }
        public PlayListNode(String urlString)
        {
            Url = new Uri(urlString);
            FileName = "";
        }
    }
    #endregion
}
