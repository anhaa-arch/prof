import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('upload/:workId')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('workId') workId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user.id;

    const workFile = await this.filesService.uploadFile(workId, userId, {
      filename: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer,
    });

    return workFile;
  }

  @Get(':fileId/url')
  @UseGuards(AuthGuard('jwt'))
  async getFileUrl(@Param('fileId') fileId: string) {
    const url = await this.filesService.getFileUrl(fileId);
    return { url };
  }

  @Delete(':fileId')
  @UseGuards(AuthGuard('jwt'))
  async deleteFile(@Param('fileId') fileId: string, @Req() req: any) {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    return this.filesService.deleteFile(fileId, userId, isAdmin);
  }

  @Get('work/:workId')
  @UseGuards(AuthGuard('jwt'))
  async getWorkFiles(@Param('workId') workId: string) {
    return this.filesService.getWorkFiles(workId);
  }
}

