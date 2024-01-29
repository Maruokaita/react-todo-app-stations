// 必要なライブラリやモジュールのインポート
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { url } from "../const";
import "./editList.scss";

// EditListコンポーネントの定義
export const EditList = () => {
  // React Routerのナビゲーションフックを使用
  const navigate = useNavigate();
  // パラメータからリストIDを取得
  const { listId } = useParams();
  // タイトルの状態とエラーメッセージの状態を管理
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  // クッキーを管理するためのReact Cookieフックを使用
  const [cookies] = useCookies();

  // タイトルが変更された時のハンドラ関数
  const handleTitleChange = (e) => setTitle(e.target.value);

  // リストの更新処理
  const onUpdateList = () => {
    // リクエストデータの作成
    const data = {
      title: title,
    };

    // axiosを使用してAPI経由でリストを更新
    axios
      .put(`${url}/lists/${listId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        // 更新成功時にトップページにリダイレクト
        navigate("/");
      })
      .catch((err) => {
        // エラーメッセージの設定
        setErrorMessage(`更新に失敗しました。 ${err}`);
      });
  };

  // リストの削除処理
  const onDeleteList = () => {
    // axiosを使用してAPI経由でリストを削除
    axios
      .delete(`${url}/lists/${listId}`, {
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

  // リスト情報の取得処理（初回のみ実行）
  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        // 取得したリスト情報からタイトルを設定
        const list = res.data;
        setTitle(list.title);
      })
      .catch((err) => {
        // エラーメッセージの設定
        setErrorMessage(`リスト情報の取得に失敗しました。${err}`);
      });
  }, [listId, cookies.token]);

  // JSXを返す
  return (
    <div>
      <Header />
      <main className="edit-list">
        <h2>リスト編集</h2>
        {/* エラーメッセージの表示 */}
        <p className="error-message">{errorMessage}</p>
        {/* フォームの定義 */}
        <form className="edit-list-form">
          {/* タイトル入力欄 */}
          <label>タイトル</label>
          <br />
          <input
            type="text"
            className="edit-list-title"
            value={title}
            onChange={handleTitleChange}
          />
          <br />
          {/* リスト削除ボタン */}
          <button
            type="button"
            className="delete-list-button"
            onClick={onDeleteList}
          >
            削除
          </button>
          {/* リスト更新ボタン */}
          <button
            type="button"
            className="edit-list-button"
            onClick={onUpdateList}
          >
            更新
          </button>
        </form>
      </main>
    </div>
  );
};
