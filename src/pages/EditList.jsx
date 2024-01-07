import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { url } from "../const";
import "./editList.scss";

export const EditList = () => {
  const navigate = useNavigate();
  const { listId } = useParams();
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleTitleChange = (e) => setTitle(e.target.value);

  const onUpdateList = async () => {
    try {
      const data = {
        title: title,
      };

      await axios.put(`${url}/lists/${listId}`, data);
      navigate("/");
    } catch (err) {
      setErrorMessage(`更新に失敗しました。 ${err}`);
    }
  };

  const onDeleteList = async () => {
    try {
      await axios.delete(`${url}/lists/${listId}`);
      navigate("/");
    } catch (err) {
      setErrorMessage(`削除に失敗しました。${err}`);
    }
  };

  useEffect(() => {
    const fetchList = async () => {
      try {
        const response = await axios.get(`${url}/lists/${listId}`);
        const list = response.data;
        setTitle(list.title);
      } catch (err) {
        setErrorMessage(`リスト情報の取得に失敗しました。${err}`);
      }
    };

    fetchList();
  }, [listId]);

  return (
    <div>
      <Header />
      <main className="edit-list">
        <h2>リスト編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-list-form">
          <label>タイトル</label>
          <br />
          <input
            type="text"
            className="edit-list-title"
            value={title}
            onChange={handleTitleChange}
          />
          <br />
          <button
            type="button"
            className="delete-list-button"
            onClick={onDeleteList}
          >
            削除
          </button>
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
