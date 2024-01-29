import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { Header } from "../components/Header";
import { url } from "../const";
import "./home.scss";

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState("todo"); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();

  // 新しいstateとキーボードイベントの処理を追加
  const [selectedItem, setSelectedItem] = useState(null);

  const handleIsDoneDisplayChange = (e) => {
    setIsDoneDisplay(e.target.value);
  };

  // 初回のリスト取得と選択
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
        // 初回のリストの取得後、最初のリストを選択
        const initialListId = res.data[0]?.id;
        if (initialListId) {
          setSelectListId(initialListId);
          setSelectedItem(`list-${initialListId}`);
        }
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, [cookies.token]);

  // 選択されたリストに関連するタスクの取得
  useEffect(() => {
    const listId = lists.find((list) => list.id === selectListId)?.id;
    if (listId) {
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks);
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`);
        });
    }
  }, [lists, cookies.token, selectListId]);

  // リストアイテムのクリック時に呼ばれる関数を追加
  const handleSelectList = (id) => {
    setSelectListId(id);
    setSelectedItem(`list-${id}`);
  };

  // キーボードイベントの処理を追加
  const handleKeyDown = useCallback(
    (event) => {
      const currentSelectedElement = document.getElementById(selectedItem);
      let nextElement;

      switch (event.key) {
        case "ArrowLeft":
          nextElement = currentSelectedElement?.previousElementSibling;
          break;
        case "ArrowRight":
          nextElement = currentSelectedElement?.nextElementSibling;
          break;
        default:
          return;
      }

      if (nextElement) {
        currentSelectedElement?.setAttribute("aria-selected", "false");
        nextElement.setAttribute("aria-selected", "true");
        setSelectedItem(nextElement.id);
        handleSelectList(nextElement.dataset.listId);
      }

      event.preventDefault();
    },
    [selectedItem, handleSelectList]
  );

  // キーボードイベントのリスナーを追加
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    // コンポーネントがアンマウントされる際にイベントリスナーを解除
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          {/* リストタブ */}
          <ul className="list-tab" role="listbox">
            {lists.map((list) => (
              <li
                key={list.id}
                role="option"
                tabIndex="0"
                className={`list-tab-item ${
                  selectedItem === `list-${list.id}` ? "active" : ""
                }`}
                onClick={() => handleSelectList(list.id)}
                id={`list-${list.id}`}
                data-list-id={list.id}
                aria-selected={selectedItem === `list-${list.id}`}
              >
                {list.title}
              </li>
            ))}
          </ul>
          {/* タスク一覧 */}
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            {/* タスク表示フィルター */}
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            {/* タスクコンポーネント */}
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

// 期限から残り時間を計算する関数
const calculateRemainingTime = (limit) => {
  if (!limit) {
    return "期限未設定";
  }

  const now = new Date();
  const limitDate = new Date(limit);
  const timeDifference = limitDate - now;

  if (timeDifference <= 0) {
    return "期限切れ";
  }

  const minutes = Math.floor(timeDifference / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}日 ${hours % 24}時間 ${minutes % 60}分`;
  } else if (hours > 0) {
    return `${hours}時間 ${minutes % 60}分`;
  } else {
    return `${minutes}分`;
  }
};

// タスクを表示するコンポーネント
const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props;
  if (tasks === null) return <></>;

  // 期限をフォーマットして残り時間を取得する関数
  const getFormattedLimit = (limit) => {
    if (limit) {
      const FormattedLimit = new Date(limit).toLocaleString();
      const remainingTime = calculateRemainingTime(limit);
      return `期限: ${FormattedLimit} / 残り時間： ${remainingTime}`;
    }
    return "";
  };

  // 完了または未完了のタスクを表示
  if (isDoneDisplay === "done") {
    return (
      <ul>
        {tasks
          .filter((task) => task.done === true)
          .map((task, key) => (
            <li key={key} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
              >
                `{task.title}
                <br />
                {task.done ? "完了" : "未完了"}{'　　'}{getFormattedLimit(task.limit)}`
              </Link>
            </li>
          ))}
      </ul>
    );
  }

  // 未完了のタスクを表示
  return (
    <ul>
      {tasks
        .filter((task) => task.done === false)
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              {task.title}
              <br />
              {task.done ? "完了" : "未完了"}{'　　'}{getFormattedLimit(task.limit)}
            </Link>
          </li>
        ))}
    </ul>
  );
};
