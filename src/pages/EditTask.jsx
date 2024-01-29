// Reactおよび関連ライブラリのインポート
import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import axios from "axios";
import { useCookies } from "react-cookie";
import { url } from "../const";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./editTask.scss";

// EditTaskコンポーネントの定義
export const EditTask = () => {
  // React Routerのナビゲーションフックを使用
  const navigate = useNavigate();
  // パラメータからリストIDとタスクIDを取得
  const { listId, taskId } = useParams();
  // クッキーを管理するためのReact Cookieフックを使用
  const [cookies] = useCookies();
  // タスク情報を管理するための状態を設定
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isDone, setIsDone] = useState();
  const [limit, setLimit] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // タイトル変更時のハンドラ関数
  const handleTitleChange = (e) => setTitle(e.target.value);

  // 詳細変更時のハンドラ関数
  const handleDetailChange = (e) => setDetail(e.target.value);

  // 完了状態変更時のハンドラ関数
  const handleIsDoneChange = (e) => setIsDone(e.target.value === "done");

  // 期限変更時のハンドラ関数
  const handleLimitChange = (date) => setLimit(date);

  // タスク更新処理
  const onUpdateTask = () => {
    // リクエストデータの作成
    const data = {
      title: title,
      detail: detail,
      done: isDone,
      limit: limit ? limit.toISOString() : null,
    };

    // axiosを使用してAPI経由でタスクを更新
    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        // 更新成功時にトップページにリダイレクト
        navigate("/");
      })
      .catch((err) => {
        // エラーメッセージの設定
        setErrorMessage(`更新に失敗しました。${err}`);
      });
  };

  // タスク削除処理
  const onDeleteTask = () => {
    // axiosを使用してAPI経由でタスクを削除
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        // 削除成功時にトップページにリダイレクト
        navigate("/");
      })
      .catch((err) => {
        // エラーメッセージの設定
        setErrorMessage(`削除に失敗しました。${err}`);
      });
  };

  // タスク情報の取得処理（初回のみ実行）
  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        // 取得したタスク情報から各種状態を設定
        const task = res.data;
        setTitle(task.title);
        setDetail(task.detail);
        setIsDone(task.done);
        setLimit(task.limit ? new Date(task.limit) : null); // 期限の初期値を設定
      })
      .catch((err) => {
        // エラーメッセージの設定
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`);
      });
  }, [listId, taskId, cookies.token]);

  // JSXを返す
  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        {/* エラーメッセージの表示 */}
        <p className="error-message">{errorMessage}</p>
        {/* フォームの定義 */}
        <form className="edit-task-form">
          {/* タイトル入力欄 */}
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="edit-task-title"
            value={title}
          />
          <br />
          {/* 詳細入力欄 */}
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="edit-task-detail"
            value={detail}
          />
          <br />
          {/* 期限選択欄 */}
          <div>
            <label>期限</label>
            <br />
            <DatePicker
              selected={limit}
              onChange={handleLimitChange}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm:ss"
            />
          </div>
          {/* 完了状態選択欄 */}
          <div>
            <input
              type="radio"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={isDone === false ? "checked" : ""}
            />
            未完了
            <input
              type="radio"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone === true ? "checked" : ""}
            />
            完了
          </div>
          {/* タスク削除ボタン */}
          <button
            type="button"
            className="delete-task-button"
            onClick={onDeleteTask}
          >
            削除
          </button>
          {/* タスク更新ボタン */}
          <button
            type="button"
            className="edit-task-button"
            onClick={onUpdateTask}
          >
            更新
          </button>
        </form>
      </main>
    </div>
  );
};
