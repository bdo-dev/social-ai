import axios from "axios";
import dotenv from "dotenv";
import { supabase } from "../lib/subabase.js";
dotenv.config();
const accessToken = process.env.FB_ACCESS_TOKEN;
const pageId = "510008268858718";
export const publishPost = async (post) => {
  const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;
  const { content, media_urls } = post;
  try {
    const mediaFbIds = [];
    for (const mediaUrl of media_urls) {
      const el = JSON.parse(mediaUrl);
      const image = el.preview;
      const mediaUploadUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`;
      const mediaResponse = await axios.post(mediaUploadUrl, null, {
        params: {
          url: image,
          published: false,
          access_token: accessToken,
        },
      });
      mediaFbIds.push({
        media_fbid: mediaResponse.data.id,
      });
    }
    const params = {
      access_token: accessToken,
      message: content,
    };
    console.log("1");

    if (mediaFbIds.length > 0) {
      params.attached_media = JSON.stringify(mediaFbIds);
    }
    const response = await axios.post(url, null, {
      params,
    });
    const { data, error } = await supabase
      .from("posts")
      .update({
        id_post_facebook: response.data.id,
      })
      .eq("id", post.id);
    if (error) throw error;
    return response.data;
  } catch (error) {
    console.error("Error publishing post:", error);
    let errorMessage =
      "An unexpected error occurred while publishing the post.";
    if (error.response) {
      if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error.message || errorMessage;
      } else {
        errorMessage = error.response.data || errorMessage;
      }
    } else if (error.request) {
      errorMessage = "No response received from the server.";
    } else {
      errorMessage = error.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
};
export const updatePostWithMedia = async (postId, content, newMediaUrls) => {
  console.log(postId, content);
  try {
    const postUrl = `https://graph.facebook.com/v18.0/${postId}`;
    // const postResponse = await axios.get(postUrl, {
    //   params: {
    //     access_token: accessToken,
    //     fields: "attachments{media}",
    //   },
    // });

    // const existingMedia = postResponse.data.attachments?.data || [];
    // console.log(existingMedia);
    // if (existingMedia)
    //   for (const media of existingMedia) {
    //     if (media.media && media.media.id) {
    //       const deleteMediaUrl = `https://graph.facebook.com/v18.0/${media.media.id}`;
    //       await axios.delete(deleteMediaUrl, {
    //         params: {
    //           access_token: accessToken,
    //         },
    //       });
    //     }
    //   }
    // console.log(newMediaUrls);

    // const mediaFbIds = [];
    // if (newMediaUrls)
    //   for (const mediaUrl of newMediaUrls) {
    //     const el = JSON.parse(mediaUrl);
    //     const image = el.preview;
    //     const mediaUploadUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`;

    //     const mediaResponse = await axios.post(mediaUploadUrl, null, {
    //       params: {
    //         url: image,
    //         published: false,
    //         access_token: accessToken,
    //       },
    //     });

    //     mediaFbIds.push({ media_fbid: mediaResponse.data.id });
    //   }

    const params = {
      access_token: accessToken,
      message: content,
    };

    // if (mediaFbIds.length > 0) {
    //   params.attached_media = JSON.stringify(mediaFbIds);
    // }

    const updateResponse = await axios.post(postUrl, null, {
      params,
    });
    return updateResponse.data;
  } catch (error) {
    console.error("Error updating post with media:", error);
    let errorMessage = "An unexpected error occurred while updating the post.";
    if (error.response) {
      if (error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error.message || errorMessage;
      } else {
        errorMessage = error.response.data || errorMessage;
      }
    } else if (error.request) {
      errorMessage = "No response received from the server.";
    } else {
      errorMessage = error.message || errorMessage;
    }
    throw new Error(errorMessage);
  }
};
export const deleteFacebookPost = async (postId) => {
  console.log(postId);
  const url = `https://graph.facebook.com/v18.0/${postId}`;
  const params = {};
  try {
    await axios.delete(url, {
      params,
    });
  } catch (error) {
    throw new Error(
      error.response ? error.response.data.error.message : error.message
    );
  }
};
export const deleteFacebookComment = async (commentId) => {
  console.log(commentId);
  const url = `https://graph.facebook.com/v18.0/${commentId}`;
  const params = {
    access_token: accessToken,
  };
  try {
    await axios.delete(url, {
      params,
    });
  } catch (error) {
    throw new Error(
      error.response ? error.response.data.error.message : error.message
    );
  }
};
export const hideFacebookComment = async (method, data = null, commentId) => {
  const url = `https://graph.facebook.com/v18.0/${commentId}`;
  const params = {
    access_token: accessToken,
  };
  try {
    const response = await axios({
      method,
      url,
      params,
      data,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response ? error.response.data.error.message : error.message
    );
  }
};
export const fetchPostComments = async (postId) => {
  const url = `https://graph.facebook.com/v18.0/${postId}/comments`;
  const params = {
    access_token: accessToken,
  };
  try {
    const comments = await axios.get(url, {
      params,
    });
    return comments.data.data;
  } catch (error) {
    throw new Error(
      error.response ? error.response.data.error.message : error.message
    );
  }
};
export const getFacebookPostEngagement = async (postId) => {
  const url = `https://graph.facebook.com/v18.0/${postId}`;
  const params = {
    access_token: accessToken,
    fields: "likes.summary(true),comments.summary(true),shares",
  };
  try {
    const engagement = await axios.get(url, {
      params,
    });
    console.log(engagement.data);
    return engagement.data;
  } catch (error) {
    throw new Error(
      error.response ? error.response.data.error.message : error.message
    );
  }
};
//! need to fix and eidt plz
export const getFacebookPostReach = async (postId) => {
  const url = `https://graph.facebook.com/v18.0/${postId}/insights`;
  const params = {
    access_token: accessToken,
    metric: "post_impressions_unique,post_impressions",
  };
  try {
    const reach = await axios.get(url, {
      params,
    });
    const res = reach.data;
    console.log(res.data[0].values);
    return reach.data;
  } catch (error) {
    console.log(error.response.data);
    throw new Error(
      error.response ? error.response.data.error.message : error.message
    );
  }
};
