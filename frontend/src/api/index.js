const GET = async (url) => {
  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();

    if (data.error) return null;

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    return data;
  } catch (error) {
    throw new Error(error);
  }
};

const POST = async (url, body) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: !body ? null : JSON.stringify(body),
    });

    const data = await res.json();
    if (data.error) return null;

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    return data;
  } catch (error) {
    throw new Error(error);
  }
};

const DELETE = async (url) => {
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await res.json();
    if (data.error) return null;

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    return data;
  } catch (error) {
    throw new Error(error);
  }
};

const UPDATE = async (url, body) => {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: !body ? null : JSON.stringify(body),
    });

    const data = await res.json();
    if (data.error) return null;

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    return data;
  } catch (error) {
    throw new Error(error);
  }
};

const PUBLIC_ROUTE = "http://localhost:8080/api";
const PROTECTED_ROUTE = "http://localhost:8080/api/secured";

const getPostEndpoint = ({ feedType, email, userId }) => {
  switch (feedType) {
    case "forYou":
      return "http://localhost:8080/api/secured/posts/all";
    case "following":
      return "http://localhost:8080/api/secured/posts/following";
    case "posts":
      return `http://localhost:8080/api/secured/posts/user/${email}`;
    case "likes":
      return `http://localhost:8080/api/secured/posts/likes/${userId}`;
    default:
      return "http://localhost:8080/api/secured/posts/all";
  }
};

// AUTH
export const login = async ({ email, password }) => {
  const body = { email, password };
  const res = await POST(`${PUBLIC_ROUTE}/auth/login`, body);
  return res;
};

export const register = async ({ email, username, fullName, password }) => {
  const body = { email, username, fullName, password };
  const res = await POST(`${PUBLIC_ROUTE}/auth/register`, body);
  return res;
};

// GET
export const getMe = async () => {
  const res = await GET(`${PROTECTED_ROUTE}/user/me`);
  return res;
};

export const getAllPosts = async ({ feedType, email, userId }) => {
  const res = await GET(getPostEndpoint({ feedType, email, userId }));
  return res;
};

export const getSuggestUser = async () => {
  const res = await GET(`${PROTECTED_ROUTE}/user/suggested`);
  return res;
};

export const getUserProfile = async (email) => {
  const res = await GET(`${PROTECTED_ROUTE}/user/profile/${email}`);
  return res;
};

export const getNotifications = async () => {
  const res = await GET(`${PROTECTED_ROUTE}/notifications`);
  return res;
};

// POST
export const createOnePost = async ({ text, img }) => {
  const body = { text, img };
  const res = await POST(`${PROTECTED_ROUTE}/posts/create`, body);
  return res;
};

export const commentOnPost = async ({ text, id }) => {
  const body = { text };
  const res = await POST(`${PROTECTED_ROUTE}/posts/comment/${id}`, body);
  return res;
};

export const likeUnlikeOnPost = async (id) => {
  const res = await POST(`${PROTECTED_ROUTE}/posts/like/${id}`, null);
  return res;
};

export const followUnFollowUser = async (id) => {
  const res = await POST(`${PROTECTED_ROUTE}/user/follow/${id}`, null);
  return res;
};

// DELETE
export const deleteOnePost = async (id) => {
  const res = await DELETE(`${PROTECTED_ROUTE}/posts/delete/${id}`);
  return res;
};

export const deleteNotification = async () => {
  const res = await DELETE(`${PROTECTED_ROUTE}/notifications`);
  return res;
};

// UPDATE
export const updateUser = async (formData) => {
  const res = await UPDATE(`${PROTECTED_ROUTE}/user/update`, formData);
  return res;
};
