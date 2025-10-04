import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Text } from '../common/Text';
import { FiLock, FiCheck, FiX } from 'react-icons/fi';
