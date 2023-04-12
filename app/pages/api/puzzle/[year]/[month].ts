// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import path from "path";

import fs from "fs";

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const pathFile = process.cwd().replace("app", "puzzle");
  const { month = "", year = "" } = req.query;

  const dataFile = path.join(pathFile, `${year}/${month}`);
  const fileData = fs.readFileSync(dataFile, "utf8");

  res.status(200).json(JSON.parse(fileData));
}
