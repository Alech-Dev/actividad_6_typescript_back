import { Request, Response } from "express";
import shortUUID from "short-uuid";
import moment from "moment-timezone";
import { config } from "../config/config";
import ConnectionMysql from "../database/mysql";

export const getVideos = async (req: Request, res: Response) => {
  try {
    const obtVideos = await ConnectionMysql.queryMultiple(`
      SELECT \`id\`, \`title\`, \`description\`, \`_url\`, \`created_at\`, \`updated_at\`
      FROM \`details\`
      WHERE \`state\` = 1; 
   `);

    if (obtVideos === undefined) {
      return res.status(200).json({
        success: 0,
        message: {}
      });
    }

    const videosList: object[] = [];
    for (const gV of obtVideos) {
      videosList.push({
        id: gV.id,
        title: gV.title,
        description: gV.description,
        url: gV._url,
        createdAt: gV.created_at,
        updatedAt: gV.updated_at
      });
    };

    return res.status(200).json(videosList);
  } catch (error: any) {
    return res.status(500).json({
      success: 0,
      message: error.toString()
    });
  }
}

export const getVideo = async (req: Request, res: Response) => {
  try {
    const obtVideo = await ConnectionMysql.queryMultiple(`
      SELECT \`id\`, \`title\`, \`description\`, \`_url\`, \`created_at\`, \`updated_at\`
      FROM \`details\`
      WHERE \`id\` = '${req.params.id}' AND \`state\` = 1;
   `);
    if (obtVideo[0] === undefined) {
      return res.status(200).json({
        success: 0,
        data: {}
      });
    }

    return res.status(200).json({
      id: obtVideo[0].id,
      title: obtVideo[0].title,
      description: obtVideo[0].description,
      url: obtVideo[0]._url,
      createdAt: obtVideo[0].created_at,
      updatedAt: obtVideo[0].updated_at
    });
  } catch (error: any) {
    return res.status(500).json({
      success: 0,
      message: error.toString()
    });
  }
}

export const createVideo = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const bodyList: string[] = ["title", "description", "url"];
    if (Object.keys(body).length === 0) {
      return res.status(200).json({
        success: 0,
        message: 'Error: No data. Request is invalid'
      });
    }

    for (const bL of bodyList) {
      if (!Object.keys(body).includes(bL)) {
        return res.status(200).json({
          success: 0,
          message: `The ${bL} parameter is invalid`
        });
      }
      if (body[`${bL}`] === '' || typeof body[`${bL}`] !== 'string') {
        return res.status(200).json({
          success: 0,
          message: `The ${bL} parameter must be a string`
        });
      }
    }
    const id: string = shortUUID.generate();
    const title: string = body.title;
    const description: string = body.description;
    const url: string = body.url;
    const updatedAt: string = moment().tz(config.timezone).format('YYYY-MM-DD HH:mm:ss');

    const obtVideo = await ConnectionMysql.querySingle(`CALL create_video('${id}', '${title}', '${description}', '${url}', '${updatedAt}');`);
    if (obtVideo === undefined) {
      return res.status(200).json({
        success: 0,
        message: 'Error: Cannot create the video'
      });
    }

    return res.status(200).json({
      id: obtVideo.id,
      title: obtVideo.title,
      description: obtVideo.description,
      url: obtVideo._url,
      createdAt: obtVideo.created_at,
      updatedAt: obtVideo.updated_at
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: error.toString()
    });
  }
}

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id;
    const deleteVideo = await ConnectionMysql.queryMultiple(`
      UPDATE \`details\`
      SET \`state\` = ${null}
      WHERE \`id\` = '${id}' AND \`state\` = 1;
   `);
    if (deleteVideo.affectedRows === 0) {
      return res.status(200).json({
        success: 0,
        message: 'Video not found'
      });
    }

    const obtVideo = await ConnectionMysql.queryMultiple(`
      SELECT \`id\`, \`title\`, \`description\`, \`_url\`, \`created_at\`, \`updated_at\`
      FROM \`details\`
      WHERE \`id\` = '${id}' AND \`state\` IS NULL;
   `);
    console.log(obtVideo);
    if (obtVideo[0] === undefined) {
      return res.status(200).json({
        success: 0,
        data: {}
      });
    }

    return res.status(200).json({
      id: obtVideo[0].id,
      title: obtVideo[0].title,
      description: obtVideo[0].description,
      url: obtVideo[0]._url,
      createdAt: obtVideo[0].created_at,
      updatedAt: obtVideo[0].updated_at,
      deleted: true
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: error.toString()
    });
  }
}

export const updateVideo = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const bodyList: string[] = ["title", "description", "url"];
    if (Object.keys(body).length === 0) {
      return res.status(200).json({
        success: 0,
        message: 'Error: No data. Request is invalid'
      });
    }

    for (const b of Object.keys(body)) {
      if (!bodyList.includes(b)) {
        return res.status(200).json({
          success: 0,
          message: `The ${b} parameter is invalid`
        });
      }
      if (typeof body[`${b}`] !== 'string') {
        return res.status(200).json({
          success: 0,
          message: `The ${b} parameter must be a string`
        });
      }
    }

    const id: string = req.params.id;
    const querySet: string[] = [];
    body.title && body.title !== '' ? querySet.push(`\`title\` = '${body.title}'`) : undefined;
    body.description && body.description !== '' ? querySet.push(`\`description\` = '${body.description}'`) : undefined;
    body.url && body.url !== '' ? querySet.push(`\`_url\` = '${body.url}'`) : undefined;
    querySet.push(`\`updated_at\` = '${moment().tz(config.timezone).format('YYYY-MM-DD HH:mm:ss')}'`);

    const updateVideo = await ConnectionMysql.queryMultiple(`
      UPDATE \`details\`
      SET ${querySet.join(',')}
      WHERE \`id\` = '${id}' AND \`state\` = 1;
   `);
    console.log(updateVideo);
    if (updateVideo.affectedRows === 0) {
      return res.status(200).json({
        success: 0,
        message: 'Video not found'
      });
    }

    const obtVideo = await ConnectionMysql.queryMultiple(`
      SELECT \`id\`, \`title\`, \`description\`, \`_url\`, \`created_at\`, \`updated_at\`
      FROM \`details\`
      WHERE \`id\` = '${id}' AND \`state\` = 1;
   `);
    console.log(obtVideo);
    if (obtVideo[0] === undefined) {
      return res.status(200).json({
        success: 0,
        data: {}
      });
    }

    return res.status(200).json({
      id: obtVideo[0].id,
      title: obtVideo[0].title,
      description: obtVideo[0].description,
      url: obtVideo[0]._url,
      createdAt: obtVideo[0].created_at,
      updatedAt: obtVideo[0].updated_at
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      success: 0,
      message: error.toString()
    });
  }
}
